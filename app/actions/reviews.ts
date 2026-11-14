"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

function reviewImageUrls(formData: FormData) {
  return formData
    .getAll("image_urls")
    .map((value) => String(value).trim())
    .filter((url) => /^https?:\/\//i.test(url))
    .slice(0, 8)
}

async function revalidateReviewActivity(activityId: string) {
  revalidatePath("/", "layout")
  revalidatePath("/admin/reviews")
  const { data } = await supabaseAdmin.from("activities").select("slug").eq("id", activityId).single()
  if (data?.slug) revalidatePath(`/activity/${data.slug}`)
}

export async function addReview(formData: FormData) {
  try {
    const activity_id = formData.get("activity_id") as string
    const guest_name = formData.get("guest_name") as string
    const rating = parseInt(formData.get("rating") as string, 10)
    const comment = formData.get("comment") as string
    const image_urls = reviewImageUrls(formData)

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
      comment,
      image_urls,
    })

    if (error) {
      console.error("Supabase Error adding review:", error)
      throw new Error(`DB Error: ${error.message}`)
    }

    await revalidateReviewActivity(activity_id)

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
    const image_urls = reviewImageUrls(formData)

    if (!guest_name || !rating) {
      throw new Error("Missing required fields")
    }

    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5")
    }

    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("reviews")
      .select("activity_id")
      .eq("id", reviewId)
      .single()

    if (lookupError) {
      throw new Error(`DB Error: ${lookupError.message}`)
    }

    const { error } = await supabaseAdmin.from("reviews").update({
      guest_name,
      rating,
      comment,
      image_urls,
    }).eq("id", reviewId)

    if (error) {
      console.error("Supabase Error updating review:", error)
      throw new Error(`DB Error: ${error.message}`)
    }

    if (existing?.activity_id) await revalidateReviewActivity(existing.activity_id)

    return { success: true }
  } catch (err: any) {
    console.error("Failed to update review:", err)
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}

export async function deleteReview(reviewId: string) {
  try {
    const { data: existing } = await supabaseAdmin
      .from("reviews")
      .select("activity_id")
      .eq("id", reviewId)
      .single()

    const { error } = await supabaseAdmin.from("reviews").delete().eq("id", reviewId)

    if (error) {
      console.error("Supabase Error deleting review:", error)
      throw new Error(`DB Error: ${error.message}`)
    }

    if (existing?.activity_id) await revalidateReviewActivity(existing.activity_id)
    else revalidatePath("/", "layout")

    return { success: true }
  } catch (err: any) {
    console.error("Failed to delete review:", err)
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}
