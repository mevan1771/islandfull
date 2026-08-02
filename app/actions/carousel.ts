"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updateCarouselOrder(
  updates: { id: string, featured_order: number, is_featured: boolean }[]
) {
  try {
    for (const update of updates) {
      const { error } = await supabaseAdmin
        .from('activities')
        .update({ 
          featured_order: update.featured_order,
          is_featured: update.is_featured
        })
        .eq('id', update.id)
        
      if (error) throw error
    }
    
    revalidatePath('/')
    revalidatePath('/admin/carousel')
    
    return { success: true }
  } catch (error: any) {
    console.error("Failed to update carousel order:", error)
    return { success: false, error: error.message || "Failed to update carousel order" }
  }
}
