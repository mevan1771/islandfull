"use server"

import { supabaseAdmin } from "@/lib/supabase"

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

  return { 
    success: true, 
    discountAmountUsd: Number(promo.discount_amount_usd),
    code: cleanCode
  }
}
