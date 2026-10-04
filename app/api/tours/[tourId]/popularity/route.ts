import { NextResponse } from "next/server"
import { bumpPopularity } from "@/lib/popularity"

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
    if (body?.event !== "wishlist") {
      return NextResponse.json({ error: "Unsupported event" }, { status: 400 })
    }

    await bumpPopularity(tourId, 2)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Popularity route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
