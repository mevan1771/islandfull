"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { logActivity } from "@/utils/auditLogger"
import { createClient } from "@/utils/supabase/server"

export async function validatePromoCode(code: string, cartTotalUsd: number) {
  if (!code) {
    return { success: false, error: "Please enter a promo code." }
  }

  const cleanCode = code.trim().toUpperCase()

  const { data: promo, error } = await supabaseAdmin
    .from('promo_codes')
    .select('*')
    .eq('code', cleanCode)
    .single()

  if (error || !promo) {
    return { success: false, error: "Invalid promo code." }
  }

  if (!promo.is_active) {
    return { success: false, error: "This promo code is no longer active." }
  }

  if (new Date(promo.expires_at) < new Date()) {
    return { success: false, error: "This promo code has expired." }
  }

  if (promo.current_uses >= promo.max_uses) {
    return { success: false, error: "This promo code has reached its usage limit." }
  }

  if (cartTotalUsd < promo.min_order_value_usd) {
    return { success: false, error: `Your subtotal must be at least $${promo.min_order_value_usd} to use this code.` }
  }

  let discountAmountUsd = Number(promo.discount_amount_usd);
  if (promo.discount_type === 'percentage') {
    discountAmountUsd = (cartTotalUsd * Number(promo.discount_amount_usd)) / 100;
  }

  // Ensure we don't discount more than the cart total
  discountAmountUsd = Math.min(discountAmountUsd, cartTotalUsd);

  return {
    success: true,
    discountAmountUsd: discountAmountUsd,
    code: cleanCode
  }
}

export async function createPromoCode(data: any) {
  try {
    const { error } = await supabaseAdmin.from('promo_codes').insert(data)
    if (error) throw error

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await logActivity(user?.id, `Created Promo Code: ${data.code}`, 'promo_codes', null)

    revalidatePath('/admin/promos')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updatePromoCode(id: string, data: any) {
  try {
    const { error } = await supabaseAdmin.from('promo_codes').update(data).eq('id', id)
    if (error) throw error

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await logActivity(user?.id, `Updated Promo Code: ${data.code || id}`, 'promo_codes', id)

    revalidatePath('/admin/promos')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deletePromoCode(id: string, code: string) {
  try {
    const { error } = await supabaseAdmin.from('promo_codes').delete().eq('id', id)
    if (error) throw error

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await logActivity(user?.id, `Deleted Promo Code: ${code}`, 'promo_codes', id)

    revalidatePath('/admin/promos')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
