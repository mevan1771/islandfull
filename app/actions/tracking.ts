"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function incrementActivityView(activityId: string) {
  try {
    const cookieStore = await cookies()
    const cookieName = `viewed_${activityId}`

    if (cookieStore.has(cookieName)) {
      return { success: true, incremented: false }
    }

    const today = new Date().toISOString().slice(0, 10)
    const { data: activity, error: fetchError } = await supabaseAdmin
      .from("activities")
      .select("view_count, views_today, views_today_on")
      .eq("id", activityId)
      .single()

    if (fetchError || !activity) {
      const { data: fallback, error: fallbackError } = await supabaseAdmin
        .from("activities")
        .select("view_count")
        .eq("id", activityId)
        .single()
      if (fallbackError || !fallback) throw fetchError || fallbackError || new Error("Activity not found")

      const view_count = (fallback.view_count || 0) + 1
      const { error: updateError } = await supabaseAdmin
        .from("activities")
        .update({ view_count })
        .eq("id", activityId)
      if (updateError) throw updateError

      cookieStore.set(cookieName, "true", { maxAge: 86400, httpOnly: true })
      return { success: true, incremented: true, view_count, views_today: 0 }
    }

    const onToday = String(activity.views_today_on || "").slice(0, 10) === today
    const view_count = (activity.view_count || 0) + 1
    const views_today = onToday ? (activity.views_today || 0) + 1 : 1

    const { error: updateError } = await supabaseAdmin
      .from("activities")
      .update({
        view_count,
        views_today,
        views_today_on: today,
      })
      .eq("id", activityId)

    if (updateError) {
      const { error: countOnlyError } = await supabaseAdmin
        .from("activities")
        .update({ view_count })
        .eq("id", activityId)
      if (countOnlyError) throw updateError
      cookieStore.set(cookieName, "true", { maxAge: 86400, httpOnly: true })
      return { success: true, incremented: true, view_count, views_today: 0 }
    }

    cookieStore.set(cookieName, "true", { maxAge: 86400, httpOnly: true })

    return { success: true, incremented: true, view_count, views_today }
  } catch (err) {
    console.error("Failed to increment view count:", err)
    return { success: false, incremented: false }
  }
}
