"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function updateStatus(id: string, newStatus: string) {
  if (newStatus === 'cancelled') {
    const { data: booking } = await supabaseAdmin.from('bookings').select('activity_id, travel_date').eq('id', id).single();
    if (booking) {
      try {
        const { autoUnblockDate } = await import('@/app/actions/tours');
        await autoUnblockDate(booking.activity_id, booking.travel_date);
      } catch (e) {
        console.error("Failed to unblock date:", e);
      }
    }
  }

  await supabaseAdmin.from('bookings').update({ status: newStatus }).eq('id', id);
  revalidatePath('/admin');
  revalidatePath('/', 'layout');
}

export async function archiveBooking(id: string) {
  await supabaseAdmin.from('bookings').update({ is_archived: true }).eq('id', id);
  revalidatePath('/admin');
}
