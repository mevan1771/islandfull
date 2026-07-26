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
    const category_input = formData.get("category_id") as string
    const provider_name = formData.get("provider_name") as string || "IslandFull Official"
    const location = formData.get("location") as string
    const description = formData.get("description") as string
    const duration = formData.get("duration") as string
    const price_usd = parseFloat(formData.get("price_usd") as string)
    const price_lkr_approx = 0 // Automatically calculated via global rate now
    const cover_image_url = formData.get("cover_image_url") as string
    const max_capacity = parseInt(formData.get("max_capacity") as string, 10)
    const status = formData.get("status") as string || "published"
    const min_notice_days = parseInt(formData.get("min_notice_days") as string || "1", 10)
    const payment_strategy = formData.get("payment_strategy") as string || "full"
    const inventory_type = formData.get("inventory_type") as string || "private"
    const has_pickup = formData.get("has_pickup") === "on"
    const is_hidden_gem = formData.get("is_hidden_gem") === "on"
    const approx_lat_str = formData.get("approx_lat") as string
    const approx_lat = approx_lat_str ? parseFloat(approx_lat_str) : null
    const approx_lng_str = formData.get("approx_lng") as string
    const approx_lng = approx_lng_str ? parseFloat(approx_lng_str) : null
    const private_meeting_instructions = formData.get("private_meeting_instructions") as string
    const pricing_tiers_raw = formData.get("pricing_tiers") as string
    const tour_options_raw = formData.get("tour_options") as string
    const blackout_dates_raw = formData.get("blackout_dates") as string
    
    let blackout_dates = [];
    try {
      if (blackout_dates_raw) {
        blackout_dates = JSON.parse(blackout_dates_raw);
      }
    } catch (e) {
      console.warn("Failed to parse blackout_dates:", e);
    }
    
    let tour_options = null;
    try {
      if (tour_options_raw) {
        tour_options = JSON.parse(tour_options_raw);
        if (tour_options.length === 0) tour_options = null;
      }
    } catch (e) {
      console.warn("Failed to parse tour_options:", e);
    }
    
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

    let category_id = category_input;
    if (category_input) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_input);
      if (!isUUID) {
        const { data: existing } = await supabaseAdmin.from('categories').select('id').ilike('name', category_input).single();
        if (existing) {
          category_id = existing.id;
        } else {
          const { data: newCat } = await supabaseAdmin.from('categories').insert({ name: category_input, slug: generateSlug(category_input) }).select('id').single();
          if (newCat) category_id = newCat.id;
        }
      }
    }

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
      tour_options,
      payment_strategy,
      inventory_type,
      has_pickup,
      is_hidden_gem,
      blackout_dates,
      status,
      min_notice_days
    })

    if (error) {
      console.error("Supabase Error:", error)
      if (error.code === '23505') { // Unique violation
        throw new Error("A tour with a similar title already exists. Please choose a different title.")
      }
      throw new Error("Failed to insert tour into database")
    }

    // Revalidate paths so the new tour appears instantly
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (err: any) {
    console.error("Failed to create tour:", err)
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}

export async function updateTour(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const category_input = formData.get("category_id") as string
    const provider_name = formData.get("provider_name") as string || "IslandFull Official"
    const location = formData.get("location") as string
    const description = formData.get("description") as string
    const duration = formData.get("duration") as string
    const price_usd = parseFloat(formData.get("price_usd") as string)
    const price_lkr_approx = 0 // Automatically calculated via global rate now
    const cover_image_url = formData.get("cover_image_url") as string
    const max_capacity = parseInt(formData.get("max_capacity") as string, 10)
    const status = formData.get("status") as string || "published"
    const min_notice_days = parseInt(formData.get("min_notice_days") as string || "1", 10)
    const payment_strategy = formData.get("payment_strategy") as string || "full"
    const inventory_type = formData.get("inventory_type") as string || "private"
    const has_pickup = formData.get("has_pickup") === "on"
    const is_hidden_gem = formData.get("is_hidden_gem") === "on"
    const approx_lat_str = formData.get("approx_lat") as string
    const approx_lat = approx_lat_str ? parseFloat(approx_lat_str) : null
    const approx_lng_str = formData.get("approx_lng") as string
    const approx_lng = approx_lng_str ? parseFloat(approx_lng_str) : null
    const private_meeting_instructions = formData.get("private_meeting_instructions") as string
    const pricing_tiers_raw = formData.get("pricing_tiers") as string
    const tour_options_raw = formData.get("tour_options") as string
    const blackout_dates_raw = formData.get("blackout_dates") as string
    
    let blackout_dates = [];
    try {
      if (blackout_dates_raw) {
        blackout_dates = JSON.parse(blackout_dates_raw);
      }
    } catch (e) {
      console.warn("Failed to parse blackout_dates:", e);
    }
    
    let tour_options = null;
    try {
      if (tour_options_raw) {
        tour_options = JSON.parse(tour_options_raw);
        if (tour_options.length === 0) tour_options = null;
      }
    } catch (e) {
      console.warn("Failed to parse tour_options:", e);
    }
    
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

    let category_id = category_input;
    if (category_input) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category_input);
      if (!isUUID) {
        const { data: existing } = await supabaseAdmin.from('categories').select('id').ilike('name', category_input).single();
        if (existing) {
          category_id = existing.id;
        } else {
          const { data: newCat } = await supabaseAdmin.from('categories').insert({ name: category_input, slug: generateSlug(category_input) }).select('id').single();
          if (newCat) category_id = newCat.id;
        }
      }
    }

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
      tour_options,
      payment_strategy,
      inventory_type,
      has_pickup,
      is_hidden_gem,
      blackout_dates,
      status,
      min_notice_days,
      approx_lat,
      approx_lng,
      private_meeting_instructions
    }).eq('id', id)

    if (error) {
      console.error("Supabase Error:", error)
      throw new Error(`DB Error: ${error.message} (Code: ${error.code})`)
    }

    revalidatePath('/', 'layout')

    return { success: true }
  } catch (err: any) {
    console.error("Failed to update tour:", err)
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}

export async function autoBlockDate(activityId: string, dateString: string) {
  try {
    const { data: activity, error: fetchError } = await supabaseAdmin
      .from('activities')
      .select('inventory_type, blackout_dates')
      .eq('id', activityId)
      .single()

    if (fetchError || !activity) {
      console.error("Failed to fetch activity for auto-blocking:", fetchError)
      return { success: false, error: "Activity not found" }
    }

    if (activity.inventory_type === 'private') {
      const currentBlackoutDates = activity.blackout_dates || []
      
      // Only block if not already blocked
      if (!currentBlackoutDates.includes(dateString)) {
        const newBlackoutDates = [...currentBlackoutDates, dateString]
        
        const { error: updateError } = await supabaseAdmin
          .from('activities')
          .update({ blackout_dates: newBlackoutDates })
          .eq('id', activityId)

        if (updateError) {
          console.error("Failed to update blackout_dates:", updateError)
          return { success: false, error: "Failed to update database" }
        }

        revalidatePath('/', 'layout')
      }
    }
    
    return { success: true }
  } catch (err: any) {
    console.error("Auto-block date error:", err)
    return { success: false, error: err.message }
  }
}

export async function autoUnblockDate(activityId: string, dateString: string) {
  try {
    const { data: activity, error: fetchError } = await supabaseAdmin
      .from('activities')
      .select('inventory_type, blackout_dates')
      .eq('id', activityId)
      .single()

    if (fetchError || !activity) {
      console.error("Failed to fetch activity for auto-unblocking:", fetchError)
      return { success: false, error: "Activity not found" }
    }

    if (activity.inventory_type === 'private') {
      const currentBlackoutDates = activity.blackout_dates || []
      
      // Only unblock if it is currently blocked
      if (currentBlackoutDates.includes(dateString)) {
        const newBlackoutDates = currentBlackoutDates.filter((d: string) => d !== dateString)
        
        const { error: updateError } = await supabaseAdmin
          .from('activities')
          .update({ blackout_dates: newBlackoutDates })
          .eq('id', activityId)

        if (updateError) {
          console.error("Failed to update blackout_dates (unblock):", updateError)
          return { success: false, error: "Failed to update database" }
        }

        revalidatePath('/', 'layout')
      }
    }
    
    return { success: true }
  } catch (err: any) {
    console.error("Auto-unblock date error:", err)
    return { success: false, error: err.message }
  }
}

export async function toggleTourStatus(activityId: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published'
    
    const { error } = await supabaseAdmin
      .from('activities')
      .update({ status: newStatus })
      .eq('id', activityId)

    if (error) {
      console.error("Failed to toggle status:", error)
      return { success: false, error: "Failed to update status" }
    }

    revalidatePath('/', 'layout')
    return { success: true, newStatus }
  } catch (err: any) {
    console.error("Status toggle error:", err)
    return { success: false, error: err.message }
  }
}

export async function deleteTour(activityId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('activities')
      .delete()
      .eq('id', activityId)

    if (error) {
      console.error("Failed to delete tour:", error)
      return { success: false, error: "Failed to delete tour from database" }
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error("Delete tour error:", err)
    return { success: false, error: err.message }
  }
}
