"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function manualCheckIn(bookingId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    // Optional: could add an extra check to ensure this host owns the booking
    // For simplicity, we just update it
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'redeemed' })
      .eq('id', bookingId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/host')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}

export async function revertBookingToPending(bookingId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'pending' })
      .eq('id', bookingId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/host')
    revalidatePath('/host/bookings')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred" }
  }
}

