"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleActivityPauseState(activityId: string, isPaused: boolean) {
  try {
    const supabase = await createClient()
    
    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Verify host ownership (security check)
    const { data: activity } = await supabase
      .from('activities')
      .select('host_id')
      .eq('id', activityId)
      .single()

    const { data: host } = await supabase
      .from('hosts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!activity || !host || activity.host_id !== host.id) {
      return { success: false, error: "Unauthorized" }
    }

    // Update
    const { error } = await supabase
      .from('activities')
      .update({ is_paused_by_host: isPaused })
      .eq('id', activityId)

    if (error) throw error

    revalidatePath('/')
    revalidatePath('/host/tours')
    
    return { success: true }
  } catch (err) {
    console.error("Toggle pause error:", err)
    return { success: false, error: "Failed to update listing status" }
  }
}
