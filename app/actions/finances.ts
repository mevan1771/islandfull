"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getCommissionSettings() {
  const { data, error } = await supabaseAdmin
    .from('commission_settings')
    .select('*')
    .order('category_name')

  if (error) {
    console.error("Error fetching commission settings:", error)
    return []
  }

  return data
}

export async function updateGlobalCommissionRate(categoryName: string, newRate: number) {
  try {
    // 1. Update global settings
    const { error: settingsError } = await supabaseAdmin
      .from('commission_settings')
      .update({ default_rate: newRate })
      .eq('category_name', categoryName)

    if (settingsError) throw settingsError

    // 2. Update all activities in this category that do NOT have a custom commission
    const { error: activitiesError } = await supabaseAdmin
      .from('activities')
      .update({ commission_rate: newRate })
      .eq('category_type', categoryName)
      .eq('is_custom_commission', false)

    if (activitiesError) throw activitiesError

    revalidatePath('/admin/finances')
    return { success: true }
  } catch (error: any) {
    console.error("Error updating global commission:", error)
    return { success: false, error: error.message }
  }
}

export async function getFinancialLedger() {
  try {
    const { data: bookings, error } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        created_at,
        tourist_name,
        total_usd,
        discount_amount_usd,
        promo_code_applied,
        host_payout_usd,
        platform_fee_usd,
        payout_status,
        activities (
          title,
          provider_name
        )
      `)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })

    if (error) throw error

    let total_gross_volume = 0
    let total_platform_profit = 0
    let total_pending_payouts = 0

    bookings.forEach((b: any) => {
      total_gross_volume += b.total_usd || 0
      total_platform_profit += b.platform_fee_usd || 0
      if (b.payout_status === 'pending') {
        total_pending_payouts += b.host_payout_usd || 0
      }
    })

    return {
      success: true,
      metrics: {
        total_gross_volume,
        total_platform_profit,
        total_pending_payouts,
      },
      ledger: bookings
    }
  } catch (error: any) {
    console.error("Error fetching financial ledger:", error)
    return { success: false, error: error.message }
  }
}

export async function markPayoutAsPaid(bookingId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ payout_status: 'paid' })
      .eq('id', bookingId)

    if (error) throw error

    revalidatePath('/admin/earnings')
    return { success: true }
  } catch (error: any) {
    console.error("Error marking payout as paid:", error)
    return { success: false, error: error.message }
  }
}
