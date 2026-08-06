"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function incrementActivityView(activityId: string) {
  try {
    const cookieStore = await cookies()
    const cookieName = `viewed_${activityId}`
    
    // Check if cookie exists
    if (cookieStore.has(cookieName)) {
      return { success: true, incremented: false }
    }
    
    // Get current view count
    const { data: activity, error: fetchError } = await supabaseAdmin
      .from('activities')
      .select('view_count')
      .eq('id', activityId)
      .single()
      
    if (fetchError || !activity) throw fetchError || new Error("Activity not found")
    
    // Increment
    const newCount = (activity.view_count || 0) + 1
    
    const { error: updateError } = await supabaseAdmin
      .from('activities')
      .update({ view_count: newCount })
      .eq('id', activityId)
      
    if (updateError) throw updateError
    
    // Set cookie for 24 hours (86400 seconds)
    cookieStore.set(cookieName, 'true', { maxAge: 86400, httpOnly: true })
    
    return { success: true, incremented: true }
  } catch (err) {
    console.error("Failed to increment view count:", err)
    return { success: false, incremented: false }
  }
}
