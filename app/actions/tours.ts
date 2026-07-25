"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Helper function to generate a URL-friendly slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)+/g, '')    // Remove leading and trailing hyphens
}

export async function createTour(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const category_id = formData.get("category_id") as string
    const provider_name = formData.get("provider_name") as string || "IslandFull Official"
    const location = formData.get("location") as string
    const description = formData.get("description") as string
    const duration = formData.get("duration") as string
    const price_usd = parseFloat(formData.get("price_usd") as string)
    const price_lkr_approx = 0 // Automatically calculated via global rate now
    const cover_image_url = formData.get("cover_image_url") as string
    const max_capacity = parseInt(formData.get("max_capacity") as string, 10)
    const status = formData.get("status") as string || "published"
    const pricing_tiers_raw = formData.get("pricing_tiers") as string
    
    let pricing_tiers = null;
    try {
      if (pricing_tiers_raw) {
        pricing_tiers = JSON.parse(pricing_tiers_raw);
        // Ensure it's not an empty object
        if (Object.keys(pricing_tiers).length === 0) pricing_tiers = null;
      }
    } catch (e) {
      console.warn("Failed to parse pricing_tiers:", e);
    }

    // Parse inclusions from multi-line text area
    const inclusionsRaw = formData.get("inclusions") as string
    const inclusions = inclusionsRaw
      ? inclusionsRaw.split('\n').map(item => item.trim()).filter(Boolean)
      : []

    // Extract all gallery urls
    const gallery_urls = formData.getAll("gallery_urls") as string[]

    if (!title || !category_id || !location || !description || !duration || !price_usd || !cover_image_url || !max_capacity) {
      throw new Error("Missing required fields")
    }

    const slug = generateSlug(title)

    // Insert into Supabase
    const { error } = await supabaseAdmin.from('activities').insert({
      title,
      slug,
      category_id,
      provider_name,
      location,
      description,
      inclusions,
      duration,
      price_usd,
      price_lkr_approx,
      cover_image_url,
      gallery_urls,
      max_capacity,
      pricing_tiers,
      status
    })

    if (error) {
      console.error("Supabase Error:", error)
      if (error.code === '23505') { // Unique violation
        throw new Error("A tour with a similar title already exists. Please choose a different title.")
      }
      throw new Error("Failed to insert tour into database")
    }

    // Revalidate paths so the new tour appears instantly
    revalidatePath('/')
    revalidatePath('/admin/tours')
    revalidatePath('/activity/[slug]', 'page')

    return { success: true }
  } catch (err: any) {
    console.error("Failed to create tour:", err)
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}

export async function updateTour(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const category_id = formData.get("category_id") as string
    const provider_name = formData.get("provider_name") as string || "IslandFull Official"
    const location = formData.get("location") as string
    const description = formData.get("description") as string
    const duration = formData.get("duration") as string
    const price_usd = parseFloat(formData.get("price_usd") as string)
    const price_lkr_approx = 0 // Automatically calculated via global rate now
    const cover_image_url = formData.get("cover_image_url") as string
    const max_capacity = parseInt(formData.get("max_capacity") as string, 10)
    const status = formData.get("status") as string || "published"
    const pricing_tiers_raw = formData.get("pricing_tiers") as string
    
    let pricing_tiers = null;
    try {
      if (pricing_tiers_raw) {
        pricing_tiers = JSON.parse(pricing_tiers_raw);
        if (Object.keys(pricing_tiers).length === 0) pricing_tiers = null;
      }
    } catch (e) {
      console.warn("Failed to parse pricing_tiers:", e);
    }

    const inclusionsRaw = formData.get("inclusions") as string
    const inclusions = inclusionsRaw
      ? inclusionsRaw.split('\n').map(item => item.trim()).filter(Boolean)
      : []

    // Extract all gallery urls
    const gallery_urls = formData.getAll("gallery_urls") as string[]

    if (!title || !category_id || !location || !description || !duration || !price_usd || !cover_image_url || !max_capacity) {
      throw new Error("Missing required fields")
    }

    // Notice we do NOT update the slug to prevent breaking old links

    const { error } = await supabaseAdmin.from('activities').update({
      title,
      category_id,
      provider_name,
      location,
      description,
      inclusions,
      duration,
      price_usd,
      price_lkr_approx,
      cover_image_url,
      gallery_urls,
      max_capacity,
      pricing_tiers,
      status
    }).eq('id', id)

    if (error) {
      console.error("Supabase Error:", error)
      throw new Error("Failed to update tour in database")
    }

    revalidatePath('/')
    revalidatePath('/admin/tours')
    revalidatePath('/activity/[slug]', 'page')

    return { success: true }
  } catch (err: any) {
    console.error("Failed to update tour:", err)
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}
