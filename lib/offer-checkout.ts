import Stripe from "stripe"
import { supabaseAdmin } from "@/lib/supabase"
import { getExchangeRate } from "@/app/actions/settings"
import { travelRangeFromOffer } from "@/lib/date-range-label"

function rel<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export async function createCheckoutForAcceptedOffer(offerId: string) {
  const { data: offer, error } = await supabaseAdmin
    .from("offers")
    .select(
      "id, activity_id, status, offer_amount, travel_date, guest_count, guest_name, guest_email, guest_phone, special_notes, activities(id, title, commission_rate, cover_image_url)"
    )
    .eq("id", offerId)
    .eq("status", "accepted")
    .maybeSingle()

  if (error || !offer) return { error: "This offer is not waiting for payment." }

  const amount = Number(offer.offer_amount)
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Invalid offer amount." }

  const activity = rel(offer.activities as { title?: string; commission_rate?: number } | { title?: string; commission_rate?: number }[] | null)
  const match = String(offer.special_notes || "").match(/Dates:\s*(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
  const date = offer.travel_date
  const endDate = match?.[2] && match[2] !== date ? match[2] : null
  const guests = Math.max(1, Number(offer.guest_count) || 1)
  const travelLabel = travelRangeFromOffer(offer.travel_date, offer.special_notes)
  const commissionRate = Number(activity?.commission_rate) || 15
  const platformFeeUsd = (amount * commissionRate) / 100
  const hostPayoutUsd = amount - platformFeeUsd

  const offerNote = `Accepted offer ${offer.id}`
  const { data: existing } = await supabaseAdmin
    .from("bookings")
    .select("id")
    .eq("activity_id", offer.activity_id)
    .eq("status", "pending")
    .ilike("special_requests", `%${offerNote}%`)
    .maybeSingle()

  let booking = existing
  if (!booking) {
    const { data: created, error: dbError } = await supabaseAdmin
      .from("bookings")
      .insert({
        activity_id: offer.activity_id,
        tourist_name: offer.guest_name,
        tourist_email: offer.guest_email,
        tourist_whatsapp: offer.guest_phone || "",
        pax_count: guests,
        travel_date: date,
        end_date: endDate,
        total_usd: amount,
        special_requests: offerNote,
        status: "pending",
        payment_status: "unpaid",
        platform_fee_usd: platformFeeUsd,
        host_payout_usd: hostPayoutUsd,
        commission_rate_applied: commissionRate,
        exchange_rate_used: await getExchangeRate(),
      })
      .select("id")
      .single()

    if (dbError || !created) {
      console.error("offer checkout booking error:", dbError)
      return { error: "Could not start payment." }
    }
    booking = created
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2024-06-20" as any,
  })
  const base = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://islandfull.com"
  ).replace(/\/$/, "")

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: activity?.title || "IslandFull booking",
            description: `${guests} guest${guests === 1 ? "" : "s"} · ${travelLabel}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${base}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/trips`,
    client_reference_id: booking.id,
    customer_email: offer.guest_email,
  })

  if (!session.url) return { error: "Could not start Stripe." }
  return { url: session.url }
}
