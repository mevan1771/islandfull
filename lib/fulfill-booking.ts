import { supabaseAdmin } from "@/lib/supabase"
import { sendHostEmail, sendReceiptEmail } from "@/app/actions/email"

const PAID = new Set(["confirmed", "completed", "redeemed"])

export async function fulfillPaidBooking(bookingId: string | null | undefined) {
  if (!bookingId) return { success: false, error: "Missing booking id" }

  const { data: existing, error: fetchError } = await supabaseAdmin
    .from("bookings")
    .select("id, status, payment_status, paid_at, activity_id, travel_date")
    .eq("id", bookingId)
    .maybeSingle()

  if (fetchError) {
    console.error("fulfillPaidBooking fetch:", fetchError)
    return { success: false, error: fetchError.message }
  }
  if (!existing) return { success: false, error: "Booking not found" }

  const alreadyPaid = PAID.has(existing.status) && existing.payment_status === "paid"
  if (alreadyPaid && !existing.paid_at) {
    await supabaseAdmin.from("bookings").update({ paid_at: new Date().toISOString() }).eq("id", bookingId)
  }
  if (!alreadyPaid) {
    const paidAt = new Date().toISOString()
    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ status: "confirmed", payment_status: "paid", paid_at: paidAt })
      .eq("id", bookingId)

    if (updateError) {
      const { error: withoutPaidAt } = await supabaseAdmin
        .from("bookings")
        .update({ status: "confirmed", payment_status: "paid" })
        .eq("id", bookingId)
      if (withoutPaidAt) {
        const { error: statusOnly } = await supabaseAdmin
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("id", bookingId)
        if (statusOnly) {
          console.error("fulfillPaidBooking update:", updateError, withoutPaidAt, statusOnly)
          return { success: false, error: statusOnly.message }
        }
      }
    }

    const { bumpPopularityIfNewlyConfirmed } = await import("@/lib/popularity")
    await bumpPopularityIfNewlyConfirmed(bookingId, existing.status)
    const { settlePaidOffer } = await import("@/lib/offer-lifecycle")
    await settlePaidOffer(bookingId)

    if (existing.activity_id && existing.travel_date) {
      try {
        const { autoBlockDate } = await import("@/app/actions/tours")
        await autoBlockDate(existing.activity_id, existing.travel_date)
      } catch (err) {
        console.error("fulfillPaidBooking auto-block:", err)
      }
    }
  }

  if (alreadyPaid) return { success: true, already: true }

  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("*, activities(title, cover_image_url, hosts(name, email)), hotels(title, cover_image_url, hosts(name, email))")
    .eq("id", bookingId)
    .single()

  if (!booking) return { success: true }

  try {
    if (booking.promo_code_applied) {
      const { data: currentPromo } = await supabaseAdmin
        .from("promo_codes")
        .select("current_uses, partner_commission, total_partner_earnings")
        .eq("code", booking.promo_code_applied)
        .single()
      if (currentPromo) {
        const updates: Record<string, number> = { current_uses: currentPromo.current_uses + 1 }
        if (currentPromo.partner_commission && currentPromo.partner_commission > 0) {
          updates.total_partner_earnings = (currentPromo.total_partner_earnings || 0) + currentPromo.partner_commission
        }
        await supabaseAdmin.from("promo_codes").update(updates).eq("code", booking.promo_code_applied)
      }
    }

    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://islandfull.com"
    const qrCodeUrl = `${appUrl}/api/qr?id=${encodeURIComponent(bookingId)}`
    const hotel = Array.isArray(booking.hotels) ? booking.hotels[0] : booking.hotels
    const activityTitle = booking.activities?.title || hotel?.title || "Your booking"
    const tourOption = booking.tour_option ? ` (${booking.tour_option})` : ""

    await sendReceiptEmail({
      toEmail: booking.tourist_email,
      touristName: booking.tourist_name,
      activityTitle: `${activityTitle}${tourOption}`,
      date: booking.travel_date,
      guests: booking.pax_count,
      qrCodeUrl,
      imageUrl: booking.activities?.cover_image_url || hotel?.cover_image_url,
    })

    const activityHost: any = Array.isArray(booking.activities?.hosts)
      ? booking.activities.hosts[0]
      : booking.activities?.hosts
    const hotelHost: any = Array.isArray(hotel?.hosts) ? hotel.hosts[0] : hotel?.hosts
    const host: any = activityHost || hotelHost
    if (host?.email) {
      await sendHostEmail({
        toEmail: host.email,
        hostName: host.name || "Host",
        touristName: booking.tourist_name,
        touristEmail: booking.tourist_email,
        touristPhone: booking.tourist_whatsapp,
        activityTitle: `${activityTitle}${tourOption}`,
        date: booking.travel_date,
        guests: booking.pax_count,
        totalPayout: booking.host_payout_usd,
      })
    }
  } catch (err) {
    console.error("fulfillPaidBooking notify:", err)
  }

  return { success: true }
}
