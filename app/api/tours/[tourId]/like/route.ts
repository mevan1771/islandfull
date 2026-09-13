import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ tourId: string }> }
) {
  try {
    const { tourId } = await params
    if (!tourId) {
      return NextResponse.json({ error: "Missing tour id" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const liked = Boolean(body?.liked)

    const cookieStore = await cookies()
    const cookieName = `liked_${tourId}`
    const alreadyLiked = cookieStore.has(cookieName)

    if (liked === alreadyLiked) {
      const { data } = await supabaseAdmin
        .from("activities")
        .select("like_count")
        .eq("id", tourId)
        .single()

      return NextResponse.json({ likes: data?.like_count || 0 })
    }

    const { data: activity, error: fetchError } = await supabaseAdmin
      .from("activities")
      .select("like_count")
      .eq("id", tourId)
      .single()

    if (fetchError || !activity) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    const nextCount = liked
      ? (activity.like_count || 0) + 1
      : Math.max(0, (activity.like_count || 0) - 1)

    const { error: updateError } = await supabaseAdmin
      .from("activities")
      .update({ like_count: nextCount })
      .eq("id", tourId)

    if (updateError) {
      console.error("Failed to update like count:", updateError)
      return NextResponse.json({ error: "Failed to update likes" }, { status: 500 })
    }

    if (liked) {
      cookieStore.set(cookieName, "true", { maxAge: 60 * 60 * 24 * 365, httpOnly: true })
    } else {
      cookieStore.delete(cookieName)
    }

    return NextResponse.json({ likes: nextCount })
  } catch (error) {
    console.error("Like route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
