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

export async function fetchMyBookingsFor(email: string) {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      "id, status, travel_date, end_date, pax_count, total_usd, created_at, activities(title, slug, location, card_image_url, cover_image_url)"
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
  return data || []
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
