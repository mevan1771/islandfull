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

function normalizeEmail(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase()
}

function isUnpaidStatus(status: string | null | undefined) {
  return UNPAID_STATUSES.has(String(status || "").trim().toLowerCase())
}

async function clerkGuestEmails() {
  const user = await currentUser()
  const emails = new Set<string>()
  const primary = normalizeEmail(user?.primaryEmailAddress?.emailAddress)
  if (primary) emails.add(primary)
  for (const row of user?.emailAddresses || []) {
    const value = normalizeEmail(row.emailAddress)
    if (value) emails.add(value)
  }
  return [...emails]
}

async function cancelUnpaidBookingRow(booking: {
  id: string
  status: string
  tourist_email: string | null
  activity_id: string | null
  travel_date: string | null
}, emails: string[]) {
  const bookingEmail = normalizeEmail(booking.tourist_email)
  if (!bookingEmail || !emails.includes(bookingEmail)) {
    return { ok: false as const, error: "That booking is not on this account." }
  }
  if (!isUnpaidStatus(booking.status)) {
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
  const { error } = await supabaseAdmin
    .from("bookings")
    .update({ status: "cancelled", is_archived: true })
    .eq("id", booking.id)
  if (error) {
    console.error("cancelUnpaidBookingRow update error:", error)
    return { ok: false as const, error: "Could not cancel that booking." }
  }
  return { ok: true as const }
}

export async function cancelMyBooking(id: string) {
  try {
    const emails = await clerkGuestEmails()
    if (emails.length === 0) return { success: false, error: "Sign in to cancel a booking." }
    const { data: booking } = await supabaseAdmin
      .from("bookings")
      .select("id, status, tourist_email, activity_id, travel_date")
      .eq("id", id)
      .maybeSingle()
    if (!booking) return { success: false, error: "Booking not found." }
    const result = await cancelUnpaidBookingRow(booking, emails)
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
    const emails = await clerkGuestEmails()
    if (emails.length === 0) return { success: false, error: "Sign in to clear unpaid bookings.", cancelled: 0 }
    const { data: rows, error } = await supabaseAdmin
      .from("bookings")
      .select("id, status, tourist_email, activity_id, travel_date, is_archived")
      .in("status", ["pending", "pending_payment"])
      .order("created_at", { ascending: false })
      .limit(200)
    if (error) {
      console.error("cancelMyUnpaidBookings fetch error:", error)
      return { success: false, error: "Could not load unpaid bookings.", cancelled: 0 }
    }
    const mine = (rows || []).filter((booking) => {
      if (booking.is_archived === true) return false
      return emails.includes(normalizeEmail(booking.tourist_email))
    })
    let cancelled = 0
    for (const booking of mine) {
      const result = await cancelUnpaidBookingRow(booking, emails)
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
  const normalized = normalizeEmail(email)
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, status, travel_date, end_date, pax_count, total_usd, created_at, tourist_email, is_archived, activities(title, slug, location, card_image_url, cover_image_url, category_type)"
    )
    .ilike("tourist_email", normalized)
    .neq("status", "cancelled")
    .order("travel_date", { ascending: true })
    .limit(80)
  if (error) {
    console.error("fetchMyBookingsFor error:", error)
    return []
  }
  return (data || []).filter((row: any) => {
    if (row.is_archived === true) return false
    if (normalizeEmail(row.tourist_email) !== normalized) return false
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
