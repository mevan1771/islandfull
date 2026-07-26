"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function addReview(formData: FormData) {
  try {
    const activity_id = formData.get("activity_id") as string
    const guest_name = formData.get("guest_name") as string
    const rating = parseInt(formData.get("rating") as string, 10)
    const comment = formData.get("comment") as string

    if (!activity_id || !guest_name || !rating) {
      throw new Error("Missing required fields")
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5")
    }

    const { error } = await supabaseAdmin.from("reviews").insert({
      activity_id,
      guest_name,
      rating,
      comment
    })

    if (error) {
      console.error("Supabase Error adding review:", error)
      throw new Error(`DB Error: ${error.message}`)
    }

    // Revalidate paths so the new review rating appears instantly
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (err: any) {
    console.error("Failed to add review:", err)
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}

export async function updateReview(reviewId: string, formData: FormData) {
  try {
    const guest_name = formData.get("guest_name") as string
    const rating = parseInt(formData.get("rating") as string, 10)
    const comment = formData.get("comment") as string

    if (!guest_name || !rating) {
      throw new Error("Missing required fields")
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5")
    }

    const { error } = await supabaseAdmin.from("reviews").update({
      guest_name,
      rating,
      comment
    }).eq('id', reviewId)

    if (error) {
      console.error("Supabase Error updating review:", error)
      throw new Error(`DB Error: ${error.message}`)
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error("Failed to update review:", err)
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const { error } = await supabaseAdmin.from("reviews").delete().eq('id', reviewId)
    
    if (error) {
      console.error("Supabase Error deleting review:", error)
      throw new Error(`DB Error: ${error.message}`)
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error("Failed to delete review:", err)
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}

