"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function toggleActivityBlock(activityId: string, blockedDate: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { data: host } = await supabase
      .from('hosts')
      .select('id')
      .eq('user_id', user.id)
      .single()
      
    if (!host) return { success: false, error: "Unauthorized" }

    // Verify activity ownership
    const { data: activity } = await supabase
      .from('activities')
      .select('host_id')
      .eq('id', activityId)
      .single()

    if (activity?.host_id !== host.id) {
      return { success: false, error: "Unauthorized: You do not own this activity." }
    }

    // Check if block exists
    const { data: existingBlock } = await supabase
      .from('activity_blocks')
      .select('id')
      .eq('activity_id', activityId)
      .eq('blocked_date', blockedDate)
      .single()

    if (existingBlock) {
      // Delete block
      const { error } = await supabase
        .from('activity_blocks')
        .delete()
        .eq('id', existingBlock.id)

      if (error) throw error
    } else {
      // Insert block
      const { error } = await supabase
        .from('activity_blocks')
        .insert({
          activity_id: activityId,
          host_id: host.id,
          blocked_date: blockedDate
        })

      if (error) throw error
    }

    revalidatePath('/host/calendar')
    revalidatePath(`/activity/[slug]`, 'page') // Revalidate activity page if it's cached
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}
