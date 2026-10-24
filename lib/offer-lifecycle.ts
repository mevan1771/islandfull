import { supabaseAdmin } from "@/lib/supabase"
import { addDays, parseISO } from "date-fns"
import { OFFER_PAY_HOURS } from "@/lib/offer-countdown"

export { OFFER_PAY_HOURS }

export function offerPaymentExpiresAt(from = new Date()) {
  return new Date(from.getTime() + OFFER_PAY_HOURS * 60 * 60 * 1000).toISOString()
}

export function offerStayRange(travelDate: string, specialNotes?: string | null) {
  const start = String(travelDate || "").slice(0, 10)
  const match = String(specialNotes || "").match(/Dates:\s*(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
  const end = match?.[2] || start
  return { start, end }
}

function nextDay(iso: string) {
  const day = parseISO(iso)
  if (Number.isNaN(day.getTime())) return iso
  return addDays(day, 1).toISOString().slice(0, 10)
}

/** Hotel nights use exclusive checkout. A one-date offer is treated as one night. */
export function hotelNightsOverlap(
  a: { start: string; end: string },
  b: { start: string; end: string }
) {
  const aEnd = a.end > a.start ? a.end : nextDay(a.start)
  const bEnd = b.end > b.start ? b.end : nextDay(b.start)
  return a.start < bEnd && b.start < aEnd
}

export async function expireStaleAcceptedOffers() {
  const now = new Date().toISOString()
  const overdue = await supabaseAdmin
    .from("offers")
    .update({ status: "expired", updated_at: now })
    .eq("status", "accepted")
    .not("payment_expires_at", "is", null)
    .lt("payment_expires_at", now)
  if (overdue.error) console.error("expireStaleAcceptedOffers error:", overdue.error)

  const legacy = await supabaseAdmin
    .from("offers")
    .update({ status: "expired", updated_at: now })
    .eq("status", "accepted")
    .is("payment_expires_at", null)
  if (legacy.error) console.error("expireLegacyAcceptedOffers error:", legacy.error)

  const overdueTrips = await supabaseAdmin
    .from("transport_trip_requests")
    .update({ status: "expired", updated_at: now })
    .eq("status", "accepted")
    .not("payment_expires_at", "is", null)
    .lt("payment_expires_at", now)
  if (overdueTrips.error) console.error("expireStaleTripRequests error:", overdueTrips.error)

  const stalePending = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
  const pendingTrips = await supabaseAdmin
    .from("transport_trip_requests")
    .update({ status: "expired", updated_at: now })
    .eq("status", "pending")
    .lt("created_at", stalePending)
  if (pendingTrips.error) console.error("expirePendingTripRequests error:", pendingTrips.error)
}

type OfferStayRow = {
  id: string
  hotel_id?: string | null
  guest_email: string
  clerk_user_id?: string | null
  travel_date: string
  special_notes?: string | null
}

export async function declineOverlappingHotelOffers(paid: OfferStayRow) {
  if (!paid.hotel_id) return
  const paidStay = offerStayRange(paid.travel_date, paid.special_notes)
  const email = String(paid.guest_email || "").trim().toLowerCase()
  const select =
    "id, hotel_id, travel_date, special_notes, guest_email, clerk_user_id, status"
  const [{ data: byEmail }, { data: byUser }] = await Promise.all([
    email
      ? supabaseAdmin
          .from("offers")
          .select(select)
          .eq("guest_email", email)
          .not("hotel_id", "is", null)
          .neq("id", paid.id)
          .in("status", ["pending", "accepted", "countered"])
      : Promise.resolve({ data: [] as OfferStayRow[] }),
    paid.clerk_user_id
      ? supabaseAdmin
          .from("offers")
          .select(select)
          .eq("clerk_user_id", paid.clerk_user_id)
          .not("hotel_id", "is", null)
          .neq("id", paid.id)
          .in("status", ["pending", "accepted", "countered"])
      : Promise.resolve({ data: [] as OfferStayRow[] }),
  ])
  const seen = new Set<string>()
  const ids: string[] = []
  for (const row of [...(byEmail || []), ...(byUser || [])]) {
    if (!row?.id || seen.has(row.id) || !row.hotel_id) continue
    seen.add(row.id)
    const stay = offerStayRange(row.travel_date, row.special_notes)
    if (hotelNightsOverlap(paidStay, stay)) ids.push(row.id)
  }
  if (ids.length === 0) return
  const now = new Date().toISOString()
  const { error } = await supabaseAdmin
    .from("offers")
    .update({ status: "declined", payment_expires_at: null, updated_at: now })
    .in("id", ids)
    .in("status", ["pending", "accepted", "countered"])
  if (error) console.error("declineOverlappingHotelOffers error:", error)
}

export async function settlePaidOffer(bookingId: string) {
  if (!bookingId) return
  const { data: booking } = await supabaseAdmin
    .from("bookings")
    .select("id, offer_id, hotel_id, special_requests")
    .eq("id", bookingId)
    .maybeSingle()
  if (!booking) return

  let offerId = booking.offer_id as string | null
  if (!offerId) {
    const match = String(booking.special_requests || "").match(
      /Accepted offer ([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i
    )
    offerId = match?.[1] || null
  }
  if (!offerId) return

  const { data: offer } = await supabaseAdmin
    .from("offers")
    .select("id, hotel_id, guest_email, clerk_user_id, travel_date, special_notes, status, trip_request_id")
    .eq("id", offerId)
    .maybeSingle()
  if (!offer) return

  if (offer.status !== "paid") {
    const { error } = await supabaseAdmin
      .from("offers")
      .update({
        status: "paid",
        payment_expires_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", offerId)
    if (error) console.error("settlePaidOffer status error:", error)
  }

  if (offer.trip_request_id) {
    const { error: tripError } = await supabaseAdmin
      .from("transport_trip_requests")
      .update({ status: "paid", payment_expires_at: null, updated_at: new Date().toISOString() })
      .eq("id", offer.trip_request_id)
    if (tripError) console.error("settlePaidOffer trip error:", tripError)
  }

  if (offer.hotel_id) await declineOverlappingHotelOffers(offer)
}
