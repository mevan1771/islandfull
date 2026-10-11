"use server"

import { currentUser } from "@clerk/nextjs/server"
import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/utils/auditLogger"
import { createClient } from "@/utils/supabase/server"

export async function updateStatus(id: string, newStatus: string) {
  const { data: booking } = await supabaseAdmin.from('bookings').select('activity_id, travel_date, status').eq('id', id).single();

  if (newStatus === 'cancelled' && booking) {
    try {
      const { autoUnblockDate } = await import('@/app/actions/tours');
      await autoUnblockDate(booking.activity_id, booking.travel_date);
    } catch (e) {
      console.error("Failed to unblock date:", e);
    }
  }

  await supabaseAdmin.from('bookings').update({ status: newStatus }).eq('id', id);

  if (newStatus === 'confirmed') {
    const { bumpPopularityIfNewlyConfirmed } = await import('@/lib/popularity')
    await bumpPopularityIfNewlyConfirmed(id, booking?.status)
  }
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await logActivity(user?.id, `Updated Booking Status to ${newStatus}`, 'bookings', id)
  
  revalidatePath('/admin');
  revalidatePath('/', 'layout');
}

export async function archiveBooking(id: string) {
  await supabaseAdmin.from('bookings').update({ is_archived: true }).eq('id', id);
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await logActivity(user?.id, `Archived Booking`, 'bookings', id)
  
  revalidatePath('/admin');
}

const UNPAID_STATUSES = new Set(["pending", "pending_payment"])

async function clerkGuestEmail() {
  const user = await currentUser()
  return user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null
}

async function cancelUnpaidBookingRow(booking: {
  id: string
  status: string
  tourist_email: string | null
  activity_id: string | null
  travel_date: string | null
}, email: string) {
  if (booking.tourist_email?.toLowerCase() !== email) return { ok: false as const, error: "That booking is not on this account." }
  if (!UNPAID_STATUSES.has(String(booking.status || ""))) {
    return { ok: false as const, error: "Paid trips need a host to cancel. Email us if you need help." }
  }
  if (booking.activity_id && booking.travel_date) {
    try {
      const { autoUnblockDate } = await import("@/app/actions/tours")
      await autoUnblockDate(booking.activity_id, booking.travel_date)
    } catch (e) {
      console.error("Failed to unblock date:", e)
    }
  }
  await supabaseAdmin.from("bookings").update({ status: "cancelled" }).eq("id", booking.id)
  return { ok: true as const }
}

export async function cancelMyBooking(id: string) {
  try {
    const email = await clerkGuestEmail()
    if (!email) return { success: false, error: "Sign in to cancel a booking." }
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("id, status, tourist_email, activity_id, travel_date")
      .eq("id", id)
      .maybeSingle()
    if (!booking) return { success: false, error: "Booking not found." }
    const result = await cancelUnpaidBookingRow(booking, email)
    if (!result.ok) return { success: false, error: result.error }
    revalidatePath("/trips")
    revalidatePath("/admin")
    return { success: true }
  } catch (err) {
    console.error("cancelMyBooking error:", err)
    return { success: false, error: "Could not cancel that booking." }
  }
}

export async function cancelMyUnpaidBookings() {
  try {
    const email = await clerkGuestEmail()
    if (!email) return { success: false, error: "Sign in to clear unpaid bookings.", cancelled: 0 }
    const { data: rows } = await supabaseAdmin
      .from("bookings")
      .select("id, status, tourist_email, activity_id, travel_date")
      .eq("tourist_email", email)
      .in("status", ["pending", "pending_payment"])
      .neq("is_archived", true)
    let cancelled = 0
    for (const booking of rows || []) {
      const result = await cancelUnpaidBookingRow(booking, email)
      if (result.ok) cancelled += 1
    }
    revalidatePath("/trips")
    revalidatePath("/admin")
    return { success: true, cancelled }
  } catch (err) {
    console.error("cancelMyUnpaidBookings error:", err)
    return { success: false, error: "Could not clear unpaid bookings.", cancelled: 0 }
  }
}

export async function fetchMyBookingsFor(email: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, status, travel_date, end_date, pax_count, total_usd, created_at, activities(title, slug, location, card_image_url, cover_image_url, category_type)"
    )
    .eq("tourist_email", email)
    .neq("is_archived", true)
    .neq("status", "cancelled")
    .order("travel_date", { ascending: true })
    .limit(40)
  if (error) {
    console.error("fetchMyBookingsFor error:", error)
    return []
  }
  return (data || []).filter((row: any) => {
    const listing = Array.isArray(row.activities) ? row.activities[0] : row.activities
    return listing?.category_type !== "place"
  })
}

export async function getMyBookings() {
  try {
    const user = await currentUser()
    const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase()
    if (!email) return []
    return fetchMyBookingsFor(email)
  } catch (err) {
    console.error("getMyBookings error:", err)
    return []
  }
}
