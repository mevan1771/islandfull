"use server"

import { currentUser } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { supabaseAdmin } from "@/lib/supabase"
import { createClient } from "@/utils/supabase/server"
import { offerPayPath, siteUrl, tripActionUrl, verifyOfferActionToken } from "@/lib/offer-token"
import { expireStaleAcceptedOffers, offerPaymentExpiresAt, OFFER_PAY_HOURS } from "@/lib/offer-lifecycle"
import {
  guidePriceUsd,
  routeDistanceKm,
  routeLabel,
  stopById,
  VEHICLE_RATES,
  type RouteStop,
  type VehicleType,
} from "@/lib/transport-route"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ADMIN_INBOX = "info@islandfull.com"
const VEHICLE_SLUGS: Record<VehicleType, string[]> = {
  car: ["car", "cars"],
  van: ["van", "vans"],
  bus: ["bus", "buses"],
  "tuk-tuk": ["tuk-tuk", "tuktuk", "tuk tuk"],
  scooter: ["scooter", "scooters", "e-bike", "ebike"],
}

function rel<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function tagsOf(activity: any): string[] {
  const primary = Array.isArray(activity.categories)
    ? activity.categories.map((c: any) => c?.slug).filter(Boolean)
    : activity.categories?.slug
      ? [activity.categories.slug]
      : []
  const junction = Array.isArray(activity.activity_categories)
    ? activity.activity_categories.flatMap((row: any) => {
        const cat = row.categories
        if (!cat) return []
        return Array.isArray(cat) ? cat.map((c: any) => c?.slug) : [cat.slug]
      }).filter(Boolean)
    : []
  return [...primary, ...junction].map((slug: string) => String(slug).toLowerCase())
}

function parseStops(raw: { id?: string }[]): RouteStop[] | null {
  const stops = raw.map((item) => stopById(String(item.id || ""))).filter(Boolean) as RouteStop[]
  if (stops.length < 2) return null
  const seen = new Set<string>()
  for (const stop of stops) {
    if (seen.has(stop.id)) return null
    seen.add(stop.id)
  }
  return stops
}

async function currentHostRecord() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: host } = await supabaseAdmin
    .from("hosts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()
  return host?.id ? { hostId: host.id as string, userId: user.id } : null
}

async function matchingVehicleListings(vehicle: VehicleType) {
  const wanted = new Set(VEHICLE_SLUGS[vehicle])
  const { data, error } = await supabaseAdmin
    .from("activities")
    .select("id, title, slug, host_id, price_usd, card_image_url, cover_image_url, allow_offers, status, category_type, categories(slug), activity_categories(categories(slug)), hosts(id, email)")
    .eq("category_type", "transport")
    .eq("status", "published")
  if (error) {
    console.error("matchingVehicleListings error:", error)
    return []
  }
  const unmatched = (data || []).filter((activity) => {
    if (!tagsOf(activity).some((slug) => wanted.has(slug))) return false
    return !rel(activity.hosts as { id?: string } | { id?: string }[] | null)?.id && activity.host_id
  })
  const unresolvedIds = Array.from(new Set(unmatched.map((row) => String(row.host_id))))
  const extraHosts =
    unresolvedIds.length > 0
      ? (
          await supabaseAdmin
            .from("hosts")
            .select("id, email, user_id")
            .or(unresolvedIds.flatMap((id) => [`id.eq.${id}`, `user_id.eq.${id}`]).join(","))
        ).data || []
      : []

  const byHost = new Map<string, any>()
  for (const activity of data || []) {
    const tagged = tagsOf(activity).some((slug) => wanted.has(slug))
    const title = `${activity.title || ""} ${activity.slug || ""}`.toLowerCase()
    const titled =
      vehicle === "van"
        ? /\bvan\b|\bmini ?van\b/.test(title)
        : vehicle === "bus"
          ? /\bbus(es)?\b|\bcoach\b/.test(title)
          : vehicle === "tuk-tuk"
            ? /\btuk[- ]?tuk\b|\bthree[- ]wheeler\b/.test(title)
            : vehicle === "scooter"
              ? /\bscooter\b|\be-?bike\b/.test(title)
              : /\bcar\b|\bsedan\b/.test(title) && !/\bvan\b/.test(title)
    if (!tagged && !titled) continue
    const nested = rel(activity.hosts as { id?: string; email?: string } | { id?: string; email?: string }[] | null)
    const extra = extraHosts.find((host) => host.id === activity.host_id || host.user_id === activity.host_id)
    const hostId = nested?.id || extra?.id || null
    if (!hostId || byHost.has(hostId)) continue
    byHost.set(hostId, { ...activity, hosts: nested || extra, resolvedHostId: hostId })
  }
  return Array.from(byHost.values())
}

async function sendTripEmails(input: {
  guestName: string
  guestEmail: string
  guestPhone: string | null
  offerAmount: number
  guidePrice: number
  travelDate: string
  guestCount: number
  route: string
  km: number
  vehicle: VehicleType
  imageUrl: string | null
  hosts: { email?: string | null; recipientId: string }[]
}) {
  const { Resend } = await import("resend")
  const { render } = await import("@react-email/components")
  const React = await import("react")
  const { OfferCreatedEmail } = await import("@/components/emails/OfferCreatedEmail")
  const { OfferDecisionEmail } = await import("@/components/emails/OfferDecisionEmail")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const logoUrl = `${siteUrl()}/logo_dark.png`
  const listingTitle = `${VEHICLE_RATES[input.vehicle].label} · ${input.route}`
  const listingUrl = `${siteUrl()}/transport/plan`
  const travelLabel = input.travelDate
  const guestHtml = await render(
    React.createElement(OfferCreatedEmail, {
      variant: "guest",
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
      listingTitle,
      listingUrl,
      travelLabel,
      guests: input.guestCount,
      listTotal: input.guidePrice,
      offerTotal: input.offerAmount,
      notes: `${input.km} km · sent to ${VEHICLE_RATES[input.vehicle].label.toLowerCase()} hosts`,
      imageUrl: input.imageUrl,
      logoUrl,
      payHours: OFFER_PAY_HOURS,
    })
  )

  await resend.emails.send({
    from: "IslandFull <info@islandfull.com>",
    replyTo: ADMIN_INBOX,
    to: [input.guestEmail],
    subject: `Route sent to ${VEHICLE_RATES[input.vehicle].label.toLowerCase()} hosts`,
    html: guestHtml,
  }).catch((err) => console.error("trip guest email failed:", err))

  await Promise.allSettled(
    input.hosts.map(async (host) => {
      if (!host.email) return
      const html = await render(
        React.createElement(OfferCreatedEmail, {
          variant: "host",
          guestName: input.guestName,
          guestEmail: input.guestEmail,
          guestPhone: input.guestPhone,
          listingTitle,
          listingUrl: `${siteUrl()}/host/offers`,
          travelLabel,
          guests: input.guestCount,
          listTotal: input.guidePrice,
          offerTotal: input.offerAmount,
          notes: input.route,
          imageUrl: input.imageUrl,
          logoUrl,
          acceptUrl: tripActionUrl(host.recipientId, "accept"),
          declineUrl: tripActionUrl(host.recipientId, "decline"),
          payHours: OFFER_PAY_HOURS,
        })
      )
      await resend.emails.send({
        from: "IslandFull <info@islandfull.com>",
        replyTo: ADMIN_INBOX,
        to: Array.from(new Set([ADMIN_INBOX, host.email])),
        subject: `New ${VEHICLE_RATES[input.vehicle].label.toLowerCase()} trip offer — $${input.offerAmount}`,
        html,
      })
    })
  )
}

async function sendGuestTripDecision(offerLike: {
  guest_name: string
  guest_email: string
  offer_amount: number
  travel_date: string
  status: "accepted" | "declined"
  title: string
  imageUrl?: string | null
  payUrl?: string
}) {
  const { Resend } = await import("resend")
  const { render } = await import("@react-email/components")
  const React = await import("react")
  const { OfferDecisionEmail } = await import("@/components/emails/OfferDecisionEmail")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const html = await render(
    React.createElement(OfferDecisionEmail, {
      guestName: offerLike.guest_name,
      activityTitle: offerLike.title,
      travelLabel: offerLike.travel_date,
      amount: Number(offerLike.offer_amount),
      status: offerLike.status,
      listingUrl: `${siteUrl()}/trips`,
      payUrl: offerLike.payUrl || `${siteUrl()}/trips`,
      payHours: OFFER_PAY_HOURS,
      imageUrl: offerLike.imageUrl || null,
      logoUrl: `${siteUrl()}/logo_dark.png`,
    })
  )
  await resend.emails.send({
    from: "IslandFull <info@islandfull.com>",
    replyTo: ADMIN_INBOX,
    to: [offerLike.guest_email],
    subject:
      offerLike.status === "accepted"
        ? `A ${offerLike.title} host accepted your price`
        : `No ${offerLike.title} host took this price`,
    html,
  })
}

export async function createTransportTripRequest(input: {
  vehicleType: VehicleType
  wantsGuide?: boolean
  stopIds: string[]
  travelDate: string
  guestCount: number
  offerAmount: number
  guestName: string
  guestEmail: string
  guestPhone?: string
}) {
  try {
    const vehicle = VEHICLE_RATES[input.vehicleType] ? input.vehicleType : "car"
    const wantsGuide = Boolean(input.wantsGuide)
    const stops = parseStops((input.stopIds || []).map((id) => ({ id })))
    const guestName = (input.guestName || "").trim()
    const guestEmail = (input.guestEmail || "").trim().toLowerCase()
    const guestPhone = (input.guestPhone || "").trim() || null
    const travelDate = (input.travelDate || "").trim()
    const offerAmount = Number(input.offerAmount)
    const guestCount = Math.max(1, Math.floor(Number(input.guestCount) || 1))
    const maxGuests = VEHICLE_RATES[vehicle].maxGuests

    if (!stops || !guestName || !EMAIL_RE.test(guestEmail) || !travelDate) {
      return { success: false, error: "Add at least two stops, a date, and your contact details." }
    }
    if (!Number.isFinite(offerAmount) || offerAmount < 1) {
      return { success: false, error: "Enter the price you want to offer." }
    }
    if (guestCount > maxGuests) {
      return { success: false, error: `${VEHICLE_RATES[vehicle].label}s take up to ${maxGuests} guests.` }
    }

    const km = routeDistanceKm(stops)
    const guide = guidePriceUsd(km, vehicle, wantsGuide)
    const listings = await matchingVehicleListings(vehicle)
    if (listings.length === 0) {
      return { success: false, error: `No ${VEHICLE_RATES[vehicle].label.toLowerCase()} hosts are live yet. Try the other vehicle, or check back soon.` }
    }

    let clerkUserId: string | null = null
    try {
      const user = await currentUser()
      clerkUserId = user?.id || null
    } catch {
      clerkUserId = null
    }

    const { data: request, error } = await supabaseAdmin
      .from("transport_trip_requests")
      .insert({
        clerk_user_id: clerkUserId,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        vehicle_type: vehicle,
        wants_guide: wantsGuide,
        travel_date: travelDate,
        guest_count: guestCount,
        offer_amount: offerAmount,
        guide_price: guide,
        route_km: km,
        stops,
        status: "pending",
      })
      .select("id")
      .single()

    if (error || !request) {
      console.error("createTransportTripRequest insert error:", error)
      return { success: false, error: "Could not send this route. Please try again." }
    }

    const recipients = listings.map((listing) => ({
      request_id: request.id,
      host_id: listing.resolvedHostId,
      activity_id: listing.id,
    }))
    const { data: inserted, error: recError } = await supabaseAdmin
      .from("transport_trip_recipients")
      .insert(recipients)
      .select("id, host_id, activity_id")

    if (recError || !inserted?.length) {
      console.error("createTransportTripRequest recipients error:", recError)
      await supabaseAdmin.from("transport_trip_requests").delete().eq("id", request.id)
      return { success: false, error: "Could not reach hosts. Please try again." }
    }

    const hosts = inserted.map((row) => {
      const listing = listings.find((item) => item.id === row.activity_id)
      const host = rel(listing?.hosts as { email?: string } | { email?: string }[] | null)
      return { email: host?.email || null, recipientId: row.id }
    })

    sendTripEmails({
      guestName,
      guestEmail,
      guestPhone,
      offerAmount,
      guidePrice: guide,
      travelDate,
      guestCount,
      route: routeLabel(stops),
      km,
      vehicle,
      imageUrl: stops[0]?.image || listings[0]?.card_image_url || listings[0]?.cover_image_url || null,
      hosts,
    }).catch((err) => console.error("trip emails failed:", err))

    revalidatePath("/trips")
    revalidatePath("/host/offers")
    return { success: true, id: request.id, hostCount: inserted.length }
  } catch (err) {
    console.error("createTransportTripRequest error:", err)
    return { success: false, error: "Could not send this route. Please try again." }
  }
}

async function acceptRecipient(recipientId: string) {
  const { data: recipient } = await supabaseAdmin
    .from("transport_trip_recipients")
    .select("id, request_id, host_id, activity_id, status")
    .eq("id", recipientId)
    .maybeSingle()
  if (!recipient || recipient.status !== "pending") {
    return { success: false, error: "This trip is no longer waiting." }
  }

  const now = new Date().toISOString()
  const expires = offerPaymentExpiresAt()
  const { data: request, error: lockError } = await supabaseAdmin
    .from("transport_trip_requests")
    .update({
      status: "accepted",
      accepted_host_id: recipient.host_id,
      accepted_activity_id: recipient.activity_id,
      payment_expires_at: expires,
      updated_at: now,
    })
    .eq("id", recipient.request_id)
    .eq("status", "pending")
    .select("*")
    .maybeSingle()

  if (lockError) {
    console.error("acceptRecipient lock error:", lockError)
    return { success: false, error: "Could not accept this trip." }
  }
  if (!request) {
    return { success: false, error: "Another host already took this trip." }
  }

  await supabaseAdmin
    .from("transport_trip_recipients")
    .update({ status: "accepted" })
    .eq("id", recipient.id)
  await supabaseAdmin
    .from("transport_trip_recipients")
    .update({ status: "closed" })
    .eq("request_id", request.id)
    .eq("status", "pending")
    .neq("id", recipient.id)

  const notes = `Route: ${routeLabel(Array.isArray(request.stops) ? request.stops : [])}\nVehicle: ${request.vehicle_type}\nGuide: ${request.wants_guide ? "yes" : "no"}\nDistance: ${request.route_km} km`
  const { data: offer, error: offerError } = await supabaseAdmin
    .from("offers")
    .insert({
      activity_id: recipient.activity_id,
      trip_request_id: request.id,
      clerk_user_id: request.clerk_user_id,
      guest_name: request.guest_name,
      guest_email: request.guest_email,
      guest_phone: request.guest_phone,
      offer_amount: request.offer_amount,
      travel_date: request.travel_date,
      guest_count: request.guest_count,
      special_notes: notes,
      status: "accepted",
      payment_expires_at: expires,
    })
    .select("id")
    .single()

  if (offerError || !offer) {
    console.error("acceptRecipient offer error:", offerError)
    await supabaseAdmin
      .from("transport_trip_requests")
      .update({
        status: "pending",
        accepted_host_id: null,
        accepted_activity_id: null,
        payment_expires_at: null,
        updated_at: now,
      })
      .eq("id", request.id)
    await supabaseAdmin.from("transport_trip_recipients").update({ status: "pending" }).eq("request_id", request.id)
    return { success: false, error: "Could not open payment for this trip. Try again." }
  }

  await supabaseAdmin
    .from("transport_trip_requests")
    .update({ accepted_offer_id: offer.id, updated_at: now })
    .eq("id", request.id)

  const title = `${VEHICLE_RATES[request.vehicle_type as VehicleType]?.label || "Car"} · ${routeLabel(Array.isArray(request.stops) ? request.stops : [])}`
  sendGuestTripDecision({
    guest_name: request.guest_name,
    guest_email: request.guest_email,
    offer_amount: Number(request.offer_amount),
    travel_date: request.travel_date,
    status: "accepted",
    title,
    imageUrl: Array.isArray(request.stops) ? request.stops[0]?.image : null,
    payUrl: `${siteUrl()}${offerPayPath(offer.id)}`,
  }).catch((err) => console.error("trip accept email failed:", err))

  revalidatePath("/trips")
  revalidatePath("/host/offers")
  revalidatePath("/host")
  revalidatePath("/admin/offers")
  return { success: true }
}

async function declineRecipient(recipientId: string) {
  const { data: recipient } = await supabaseAdmin
    .from("transport_trip_recipients")
    .select("id, request_id, status")
    .eq("id", recipientId)
    .maybeSingle()
  if (!recipient || recipient.status !== "pending") {
    return { success: false, error: "This trip is no longer waiting." }
  }

  await supabaseAdmin
    .from("transport_trip_recipients")
    .update({ status: "declined" })
    .eq("id", recipient.id)

  const { data: leftover } = await supabaseAdmin
    .from("transport_trip_recipients")
    .select("id")
    .eq("request_id", recipient.request_id)
    .eq("status", "pending")

  if (!leftover?.length) {
    const { data: request } = await supabaseAdmin
      .from("transport_trip_requests")
      .update({ status: "declined", updated_at: new Date().toISOString() })
      .eq("id", recipient.request_id)
      .eq("status", "pending")
      .select("guest_name, guest_email, offer_amount, travel_date, vehicle_type, stops")
      .maybeSingle()
    if (request) {
      sendGuestTripDecision({
        guest_name: request.guest_name,
        guest_email: request.guest_email,
        offer_amount: Number(request.offer_amount),
        travel_date: request.travel_date,
        status: "declined",
        title: VEHICLE_RATES[request.vehicle_type as VehicleType]?.label || "car",
        imageUrl: Array.isArray(request.stops) ? request.stops[0]?.image : null,
      }).catch((err) => console.error("trip decline email failed:", err))
    }
  }

  revalidatePath("/trips")
  revalidatePath("/host/offers")
  revalidatePath("/host")
  return { success: true }
}

export async function respondToTripRecipient(recipientId: string, status: "accepted" | "declined") {
  const host = await currentHostRecord()
  if (!host) return { success: false, error: "Unauthorized" }
  const { data: recipient } = await supabaseAdmin
    .from("transport_trip_recipients")
    .select("id, host_id")
    .eq("id", recipientId)
    .maybeSingle()
  if (!recipient || recipient.host_id !== host.hostId) return { success: false, error: "Unauthorized" }
  return status === "accepted" ? acceptRecipient(recipientId) : declineRecipient(recipientId)
}

export async function confirmTripFromEmail(formData: FormData) {
  const id = String(formData.get("id") || "")
  const action = String(formData.get("action") || "")
  const token = String(formData.get("token") || "")
  if (!verifyOfferActionToken(id, action, token) || (action !== "accept" && action !== "decline")) {
    redirect("/offers/processed?status=invalid")
  }
  const result = action === "accept" ? await acceptRecipient(id) : await declineRecipient(id)
  redirect(`/offers/processed?status=${result.success ? (action === "accept" ? "accepted" : "declined") : "invalid"}`)
}

export async function getHostTripOffers() {
  const host = await currentHostRecord()
  if (!host) return []
  await expireStaleAcceptedOffers()
  const { data, error } = await supabaseAdmin
    .from("transport_trip_recipients")
    .select("id, status, created_at, activity_id, request_id, request:transport_trip_requests!request_id(*)")
    .eq("host_id", host.hostId)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("getHostTripOffers error:", error)
    return []
  }
  return (data || []).map((row: any) => {
    const req = rel(row.request) || row.request || {}
    const stops = Array.isArray(req.stops) ? req.stops : []
    const paid = req.status === "paid"
    const status =
      req.status === "expired" || req.status === "paid" || req.status === "declined"
        ? req.status
        : row.status === "closed"
          ? "declined"
          : row.status
    return {
      id: row.id,
      source: "trip" as const,
      status,
      offer_amount: Number(req.offer_amount) || 0,
      travel_date: req.travel_date,
      guest_count: req.guest_count,
      special_notes: routeLabel(stops),
      created_at: row.created_at,
      payment_expires_at: req.payment_expires_at || null,
      listingTitle: `${VEHICLE_RATES[req.vehicle_type as VehicleType]?.label || "Car"} · ${routeLabel(stops)}`,
      listingKind: "trip",
      listingImage: stops[0]?.image || null,
      guestName: paid ? req.guest_name : null,
      guestEmail: paid ? req.guest_email : null,
      guestPhone: paid ? req.guest_phone : null,
    }
  })
}

export async function getMyTransportTrips(userId: string, email: string | null) {
  await expireStaleAcceptedOffers()
  const filters = email
    ? `clerk_user_id.eq.${userId},guest_email.eq.${email}`
    : `clerk_user_id.eq.${userId}`
  const { data, error } = await supabaseAdmin
    .from("transport_trip_requests")
    .select("*")
    .or(filters)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("getMyTransportTrips error:", error)
    return []
  }
  return (data || [])
    .filter((row) => !row.accepted_offer_id)
    .map((row) => {
      const stops = Array.isArray(row.stops) ? row.stops : []
      const title = `${VEHICLE_RATES[row.vehicle_type as VehicleType]?.label || "Car"} · ${routeLabel(stops)}`
      return {
        id: row.id,
        status: row.status,
        offer_amount: Number(row.offer_amount),
        travel_date: row.travel_date,
        guest_count: row.guest_count,
        special_notes: routeLabel(stops),
        created_at: row.created_at,
        payment_expires_at: row.payment_expires_at,
        activities: {
          id: row.id,
          title,
          slug: "transport-plan",
          location: routeLabel(stops),
          price_usd: Number(row.guide_price) || 0,
          card_image_url: stops[0]?.image || null,
          cover_image_url: stops[0]?.image || null,
          category_type: "transport",
          listingPath: "/transport/plan",
        },
      }
    })
}
