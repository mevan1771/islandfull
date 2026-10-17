"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/utils/supabase/server"
import { offerActionUrl, offerPayPath, offerPayUrl, siteUrl, verifyOfferActionToken } from "@/lib/offer-token"
import { formatStayRangeLabel, inclusiveDays, travelRangeFromOffer } from "@/lib/date-range-label"
import { stayListTotal, stayRateSuffix, stayUnitFromTotal } from "@/lib/stay-price"
import { expireStaleAcceptedOffers, OFFER_PAY_HOURS, offerPaymentExpiresAt } from "@/lib/offer-lifecycle"
import { differenceInDays, format, parseISO } from "date-fns"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ADMIN_INBOX = "info@islandfull.com"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return Boolean(user)
}

function rel<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

export async function createOffer(input: {
  activityId?: string
  hotelId?: string
  guestName: string
  guestEmail: string
  guestPhone?: string
  offerAmount: number
  travelDate: string
  travelEndDate?: string
  guestCount: number
  specialNotes?: string
}) {
  try {
    const guestName = (input.guestName || "").trim()
    const guestEmail = (input.guestEmail || "").trim().toLowerCase()
    const guestPhone = (input.guestPhone || "").trim() || null
    const offerAmount = Number(input.offerAmount)
    const guestCount = Math.max(1, Math.floor(Number(input.guestCount) || 1))
    const travelDate = (input.travelDate || "").trim()
    const travelEndDate = (input.travelEndDate || "").trim()
    const userNotes = (input.specialNotes || "").trim() || null
    const rangeNote =
      travelEndDate && travelEndDate !== travelDate ? `Dates: ${travelDate} to ${travelEndDate}` : null
    const specialNotes = [rangeNote, userNotes].filter(Boolean).join("\n") || null
    const travelLabel = formatStayRangeLabel(
      travelDate,
      travelEndDate || null,
      input.hotelId ? "nights" : "days"
    )

    if ((!input.activityId && !input.hotelId) || !guestName || !EMAIL_RE.test(guestEmail) || !travelDate || !Number.isFinite(offerAmount) || offerAmount <= 0) {
      return { success: false, error: "Please fill in your name, a valid email, travel date, and offer amount." }
    }

    let listingTitle = ""
    let listingSlug = ""
    let listingImage: string | null = null
    let listingKind: "activity" | "hotel" = "activity"
    let hostEmail: string | null = null
    let minGuests = 1
    let maxGuests = 20
    let listUnit = 0
    let pricingModel = "per_person"
    let categoryType = "tour"
    let bookingType = "single_day"
    let activityId: string | null = null
    let hotelId: string | null = null

    if (input.hotelId) {
      const { data: hotel, error: hotelError } = await supabaseAdmin
        .from("hotels")
        .select("id, title, slug, allow_offers, status, cover_image_url, gallery_urls, hosts(email)")
        .eq("id", input.hotelId)
        .single()
      if (hotelError || !hotel) {
        return { success: false, error: "This listing is not available." }
      }
      if (!hotel.allow_offers || hotel.status !== "published") {
        return { success: false, error: "Offers are not open for this listing." }
      }
      listingKind = "hotel"
      hotelId = hotel.id
      listingTitle = hotel.title
      listingSlug = hotel.slug
      listingImage = firstListingPhoto(hotel.cover_image_url, hotel.gallery_urls)
      const host = rel(hotel.hosts as { email?: string } | { email?: string }[] | null)
      hostEmail = host?.email || null
      const { data: hotelRooms } = await supabaseAdmin
        .from("hotel_room_types")
        .select("nightly_rate_usd")
        .eq("hotel_id", hotel.id)
        .eq("is_active", true)
      const rates = (hotelRooms || [])
        .map((room: any) => Number(room.nightly_rate_usd) || 0)
        .filter((n: number) => n > 0)
      listUnit = rates.length ? Math.min(...rates) : 0
      pricingModel = "per_night"
      categoryType = "hotel"
      bookingType = "multi_day"
      maxGuests = 20
    } else {
      const { data: activity, error: activityError } = await supabaseAdmin
        .from("activities")
        .select("id, title, slug, price_usd, allow_offers, min_guests, max_capacity, status, category_type, pricing_model, booking_type, card_image_url, cover_image_url, hosts(email)")
        .eq("id", input.activityId)
        .single()

      if (activityError || !activity) {
        return { success: false, error: "This listing is not available." }
      }
      if (!activity.allow_offers || activity.status !== "published") {
        return { success: false, error: "Offers are not open for this listing." }
      }
      if (activity.category_type !== "tour" && activity.category_type !== "transport") {
        return { success: false, error: "Offers are only available on tours and transport." }
      }
      activityId = activity.id
      listingTitle = activity.title
      listingSlug = activity.slug
      listingImage = firstListingPhoto(activity.card_image_url, activity.cover_image_url)
      listUnit = Number(activity.price_usd) || 0
      minGuests = activity.min_guests || 1
      maxGuests = activity.max_capacity || 20
      pricingModel = activity.pricing_model
      categoryType = activity.category_type
      bookingType = activity.booking_type
      const host = rel(activity.hosts as { email?: string } | { email?: string }[] | null)
      hostEmail = host?.email || null
    }

    const boundedGuests = Math.min(maxGuests, Math.max(minGuests, guestCount))

    let clerkUserId: string | null = null
    try {
      const user = await currentUser()
      clerkUserId = user?.id || null
    } catch {
      clerkUserId = null
    }

    const { data: offer, error } = await supabaseAdmin
      .from("offers")
      .insert({
        activity_id: activityId,
        hotel_id: hotelId,
        clerk_user_id: clerkUserId,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_phone: guestPhone,
        offer_amount: offerAmount,
        travel_date: travelDate,
        guest_count: boundedGuests,
        special_notes: specialNotes,
        status: "pending",
      })
      .select("id")
      .single()

    if (error || !offer) {
      console.error("createOffer insert error:", error)
      return { success: false, error: "Could not send your offer. Please try again." }
    }

    const stayDays = travelEndDate
      ? listingKind === "hotel"
        ? Math.max(1, differenceInDays(parseISO(travelEndDate), parseISO(travelDate)))
        : inclusiveDays(parseISO(travelDate), parseISO(travelEndDate))
      : 1
    const listTotal = stayListTotal({
      unitPrice: listUnit,
      guests: boundedGuests,
      days: stayDays,
      pricingModel,
      categoryType,
      bookingType,
    })
    const rateSuffix = stayRateSuffix(pricingModel, categoryType, bookingType)
    const rateArgs = {
      guests: boundedGuests,
      days: stayDays,
      pricingModel,
      categoryType,
      bookingType,
    }
    sendOfferCreatedEmails({
      offerId: offer.id,
      guestName,
      guestEmail,
      guestPhone,
      offerAmount,
      travelLabel,
      checkIn: prettyOfferDate(travelDate),
      checkOut: travelEndDate && travelEndDate !== travelDate ? prettyOfferDate(travelEndDate) : null,
      guestCount: boundedGuests,
      specialNotes: userNotes,
      activityTitle: listingTitle,
      listingUrl: listingKind === "hotel" ? `${siteUrl()}/hotel/${listingSlug}` : `${siteUrl()}/activity/${listingSlug}`,
      imageUrl: listingImage,
      basePrice: listTotal,
      listRate: stayDays > 1 ? stayUnitFromTotal({ total: listTotal, ...rateArgs }) : undefined,
      offerRate: stayDays > 1 ? stayUnitFromTotal({ total: offerAmount, ...rateArgs }) : undefined,
      rateSuffix: stayDays > 1 ? rateSuffix : undefined,
      hostEmail,
    }).catch((err) => console.error("Offer email failed:", err))

    revalidatePath("/admin/offers")
    revalidatePath("/admin")
    revalidatePath("/trips")
    return { success: true, offerId: offer.id }
  } catch (err: any) {
    console.error("createOffer error:", err)
    return { success: false, error: "Could not send your offer. Please try again." }
  }
}

function prettyOfferDate(iso: string) {
  const day = parseISO(iso)
  return Number.isNaN(day.getTime()) ? iso : format(day, "EEE d MMM yyyy")
}

function firstListingPhoto(...sources: unknown[]) {
  const urls: string[] = []
  for (const source of sources) {
    if (!source) continue
    if (Array.isArray(source)) {
      for (const item of source) {
        if (typeof item === "string" && item) urls.push(item)
      }
    } else if (typeof source === "string") {
      urls.push(source)
    }
  }
  return urls.find((url) => !/\.(mp4|webm|mov)$/i.test(url)) || null
}

async function sendOfferCreatedEmails(props: {
  offerId: string
  guestName: string
  guestEmail: string
  guestPhone: string | null
  offerAmount: number
  travelLabel: string
  checkIn: string
  checkOut: string | null
  guestCount: number
  specialNotes: string | null
  activityTitle: string
  listingUrl: string
  imageUrl: string | null
  basePrice: number
  listRate?: number
  offerRate?: number
  rateSuffix?: string
  hostEmail: string | null
}) {
  const { Resend } = await import("resend")
  const { render } = await import("@react-email/components")
  const React = await import("react")
  const { OfferCreatedEmail } = await import("@/components/emails/OfferCreatedEmail")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const logoUrl = `${siteUrl()}/logo_dark.png`
  const shared = {
    guestName: props.guestName,
    guestEmail: props.guestEmail,
    guestPhone: props.guestPhone,
    listingTitle: props.activityTitle,
    listingUrl: props.listingUrl,
    travelLabel: props.travelLabel,
    checkIn: props.checkIn,
    checkOut: props.checkOut,
    guests: props.guestCount,
    listTotal: props.basePrice,
    offerTotal: props.offerAmount,
    rateSuffix: props.rateSuffix,
    listRate: props.listRate,
    offerRate: props.offerRate,
    notes: props.specialNotes,
    imageUrl: props.imageUrl,
    logoUrl,
    payHours: OFFER_PAY_HOURS,
  }
  const guestHtml = await render(
    React.createElement(OfferCreatedEmail, { ...shared, variant: "guest" })
  )
  const hostHtml = await render(
    React.createElement(OfferCreatedEmail, {
      ...shared,
      variant: "host",
      acceptUrl: offerActionUrl(props.offerId, "accept"),
      declineUrl: offerActionUrl(props.offerId, "decline"),
    })
  )
  const hostTo = Array.from(new Set([ADMIN_INBOX, props.hostEmail].filter(Boolean))) as string[]

  await Promise.allSettled([
    resend.emails.send({
      from: "IslandFull <info@islandfull.com>",
      replyTo: ADMIN_INBOX,
      to: [props.guestEmail],
      subject: `We received your offer: ${props.activityTitle}`,
      html: guestHtml,
    }),
    resend.emails.send({
      from: "IslandFull <info@islandfull.com>",
      replyTo: ADMIN_INBOX,
      to: hostTo,
      subject: `New offer: ${props.activityTitle} — $${props.offerAmount.toFixed(2)}`,
      html: hostHtml,
    }),
  ])
}

async function sendGuestDecisionEmail(offer: {
  id?: string
  guest_name: string
  guest_email: string
  offer_amount: number
  travel_date: string
  special_notes?: string | null
  status: string
  activities?: {
    title?: string
    slug?: string
    card_image_url?: string | null
    cover_image_url?: string | null
    listingPath?: string
  } | {
    title?: string
    slug?: string
    card_image_url?: string | null
    cover_image_url?: string | null
    listingPath?: string
  }[] | null
}) {
  const listing = rel(offer.activities)
  const title = listing?.title || "your trip"
  const slug = listing?.slug
  const listingUrl = listing?.listingPath
    ? `${siteUrl()}${listing.listingPath}`
    : slug
      ? `${siteUrl()}/activity/${slug}`
      : siteUrl()
  const payUrl = offer.id ? offerPayUrl(offer.id) : listingUrl
  const travelLabel = travelRangeFromOffer(offer.travel_date, offer.special_notes)
  const status = offer.status === "accepted" ? "accepted" : "declined"
  const { Resend } = await import("resend")
  const { render } = await import("@react-email/components")
  const React = await import("react")
  const { OfferDecisionEmail } = await import("@/components/emails/OfferDecisionEmail")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const html = await render(
    React.createElement(OfferDecisionEmail, {
      guestName: offer.guest_name,
      activityTitle: title,
      travelLabel,
      amount: Number(offer.offer_amount),
      status,
      listingUrl,
      payUrl,
      payHours: OFFER_PAY_HOURS,
      imageUrl: listing?.card_image_url || listing?.cover_image_url || null,
      logoUrl: `${siteUrl()}/logo_dark.png`,
    })
  )

  if (offer.status === "accepted") {
    await resend.emails.send({
      from: "IslandFull <info@islandfull.com>",
      replyTo: ADMIN_INBOX,
      to: [offer.guest_email],
      subject: `Great news — your offer for ${title} was accepted`,
      html,
    })
    return
  }

  if (offer.status === "declined") {
    await resend.emails.send({
      from: "IslandFull <info@islandfull.com>",
      replyTo: ADMIN_INBOX,
      to: [offer.guest_email],
      subject: `Update on your offer for ${title}`,
      html,
    })
  }
}

export async function confirmOfferFromEmail(formData: FormData) {
  const id = String(formData.get("id") || "")
  const action = String(formData.get("action") || "")
  const token = String(formData.get("token") || "")

  if (!verifyOfferActionToken(id, action, token) || (action !== "accept" && action !== "decline")) {
    redirect("/offers/processed?status=invalid")
  }

  const { data: offer } = await supabaseAdmin
    .from("offers")
    .select("id, status, guest_name, guest_email, offer_amount, travel_date, special_notes, activities(title, slug, card_image_url, cover_image_url), hotels(title, slug, cover_image_url)")
    .eq("id", id)
    .maybeSingle()

  if (!offer || offer.status !== "pending") {
    redirect("/offers/processed?status=invalid")
  }

  const status = action === "accept" ? "accepted" : "declined"
  const { error } = await supabaseAdmin
    .from("offers")
    .update({
      status,
      payment_expires_at: status === "accepted" ? offerPaymentExpiresAt() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending")

  if (error) {
    console.error("confirmOfferFromEmail error:", error)
    redirect("/offers/processed?status=invalid")
  }

  const hotel = rel((offer as { hotels?: { title?: string; slug?: string; cover_image_url?: string | null } | { title?: string; slug?: string; cover_image_url?: string | null }[] | null }).hotels)
  sendGuestDecisionEmail({
    ...offer,
    status,
    activities: rel(offer.activities) || (hotel
      ? { title: hotel.title, slug: hotel.slug, cover_image_url: hotel.cover_image_url, listingPath: `/hotel/${hotel.slug}` }
      : null),
  }).catch((err) => console.error("Guest decision email failed:", err))
  revalidatePath("/admin/offers")
  revalidatePath("/admin")
  revalidatePath("/trips")
  revalidatePath("/host/offers")
  revalidatePath("/host")
  redirect(`/offers/processed?status=${status === "accepted" ? "accepted" : "declined"}`)
}

export async function fetchMyOffersFor(userId: string, email: string | null) {
  await expireStaleAcceptedOffers()
  const select =
    "id, status, offer_amount, travel_date, guest_count, special_notes, created_at, admin_counter_amount, guest_email, clerk_user_id, payment_expires_at, activities(id, title, slug, location, price_usd, card_image_url, cover_image_url, category_type), hotels(id, title, slug, cover_image_url, gallery_urls)"
  const [{ data: byUser }, { data: byEmail }] = await Promise.all([
    supabaseAdmin.from("offers").select(select).eq("clerk_user_id", userId).order("created_at", { ascending: false }),
    email
      ? supabaseAdmin.from("offers").select(select).eq("guest_email", email).order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as any[] }),
  ])
  const seen = new Set<string>()
  const rows: any[] = []
  for (const row of [...(byUser || []), ...(byEmail || [])]) {
    if (!row?.id || seen.has(row.id)) continue
    seen.add(row.id)
    rows.push(row)
  }
  rows.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
  return rows
    .map((row) => {
      const activity = rel(row.activities)
      const hotel = rel(row.hotels)
      const photo = firstListingPhoto(hotel?.cover_image_url, hotel?.gallery_urls)
      const listing = activity || (hotel
        ? {
            id: hotel.id,
            title: hotel.title,
            slug: hotel.slug,
            location: null,
            price_usd: 0,
            card_image_url: photo,
            cover_image_url: photo,
            category_type: "hotel",
            listingPath: `/hotel/${hotel.slug}`,
          }
        : null)
      const mapped = { ...row, activities: listing }
      if (mapped.status === "accepted" && listing) return { ...mapped, payPath: offerPayPath(mapped.id) }
      return mapped
    })
    .filter((row) => row.activities?.category_type !== "place")
}

export async function getMyOffers() {
  try {
    const user = await currentUser()
    if (!user) return []
    const email = user.primaryEmailAddress?.emailAddress?.toLowerCase() || null
    return fetchMyOffersFor(user.id, email)
  } catch (err) {
    console.error("getMyOffers error:", err)
    return []
  }
}

export async function getAcceptedOfferForPay(id: string, activityId: string) {
  if (!id || !activityId) return null
  const { data, error } = await supabaseAdmin
    .from("offers")
    .select("id, activity_id, status, offer_amount, travel_date, guest_count, guest_name, guest_email, guest_phone, special_notes")
    .eq("id", id)
    .eq("activity_id", activityId)
    .eq("status", "accepted")
    .maybeSingle()
  if (error) {
    console.error("getAcceptedOfferForPay error:", error)
    return null
  }
  return data
}

export async function getOffers() {
  await expireStaleAcceptedOffers()
  const { data, error } = await supabaseAdmin
    .from("offers")
    .select("*, activities(id, title, price_usd, category_type, slug), hotels(id, title, slug, cover_image_url)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getOffers error:", error)
    return []
  }
  return (data || []).map((row: any) => {
    const hotel = rel(row.hotels)
    if (row.activities || !hotel) return row
    return {
      ...row,
      activities: {
        id: hotel.id,
        title: hotel.title,
        slug: hotel.slug,
        price_usd: 0,
        category_type: "hotel",
      },
    }
  })
}

async function applyOfferDecision(
  id: string,
  status: "accepted" | "declined" | "countered",
  adminCounterAmount?: number | null
) {
  if (!["accepted", "declined", "countered"].includes(status)) {
    return { success: false, error: "Invalid status" }
  }

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
    payment_expires_at: status === "accepted" ? offerPaymentExpiresAt() : null,
  }
  if (status === "countered") {
    const amount = Number(adminCounterAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, error: "Enter a counter-offer amount." }
    }
    update.admin_counter_amount = amount
  }

  const { data: offer, error } = await supabaseAdmin
    .from("offers")
    .update(update)
    .eq("id", id)
    .select("id, guest_name, guest_email, offer_amount, travel_date, special_notes, status, activities(title, slug, card_image_url, cover_image_url), hotels(title, slug, cover_image_url)")
    .single()

  if (error) {
    console.error("applyOfferDecision error:", error)
    return { success: false, error: "Could not update offer." }
  }

  if (offer && (status === "accepted" || status === "declined")) {
    const hotel = rel((offer as any).hotels)
    sendGuestDecisionEmail({
      ...offer,
      activities: rel(offer.activities) || (hotel
        ? { title: hotel.title, slug: hotel.slug, cover_image_url: hotel.cover_image_url, listingPath: `/hotel/${hotel.slug}` }
        : null),
    }).catch((err) => console.error("Guest decision email failed:", err))
  }

  revalidatePath("/admin/offers")
  revalidatePath("/admin")
  revalidatePath("/trips")
  revalidatePath("/host/offers")
  revalidatePath("/host")
  return { success: true }
}

export async function updateOfferStatus(
  id: string,
  status: "accepted" | "declined" | "countered",
  adminCounterAmount?: number | null
) {
  const ok = await requireAdmin()
  if (!ok) return { success: false, error: "Unauthorized" }
  return applyOfferDecision(id, status, adminCounterAmount)
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

async function listingIdsForHost(hostId: string, userId?: string) {
  const [{ data: activities }, { data: hotels }, fallback] = await Promise.all([
    supabaseAdmin.from("activities").select("id").eq("host_id", hostId),
    supabaseAdmin.from("hotels").select("id").eq("host_id", hostId),
    userId
      ? supabaseAdmin.from("activities").select("id").eq("host_id", userId)
      : Promise.resolve({ data: [] as { id: string }[] }),
  ])
  const activityIds = Array.from(
    new Set([...(activities || []), ...(fallback.data || [])].map((row) => row.id).filter(Boolean))
  )
  const hotelIds = (hotels || []).map((row) => row.id).filter(Boolean)
  return { activityIds, hotelIds }
}

function mapHostOffer(row: any) {
  const activity = rel(row.activities)
  const hotel = rel(row.hotels)
  const photo = firstListingPhoto(
    hotel?.cover_image_url,
    hotel?.gallery_urls,
    activity?.card_image_url,
    activity?.cover_image_url
  )
  const listing = activity || (hotel
    ? {
        id: hotel.id,
        title: hotel.title,
        slug: hotel.slug,
        category_type: "hotel",
        cover_image_url: photo,
      }
    : null)
  const paid = row.status === "paid"
  return {
    id: row.id,
    status: row.status,
    offer_amount: row.offer_amount,
    travel_date: row.travel_date,
    guest_count: row.guest_count,
    special_notes: row.special_notes,
    created_at: row.created_at,
    payment_expires_at: row.payment_expires_at,
    listingTitle: listing?.title || "Listing",
    listingKind: listing?.category_type === "hotel" ? "hotel" : listing?.category_type || "tour",
    listingImage: photo,
    guestName: paid ? row.guest_name : null,
    guestEmail: paid ? row.guest_email : null,
    guestPhone: paid ? row.guest_phone : null,
  }
}

export async function getHostPendingOfferCount() {
  try {
    const host = await currentHostRecord()
    if (!host) return 0
    const { activityIds, hotelIds } = await listingIdsForHost(host.hostId, host.userId)
    if (activityIds.length === 0 && hotelIds.length === 0) return 0
    await expireStaleAcceptedOffers()
    const filters: string[] = []
    if (activityIds.length) filters.push(`activity_id.in.(${activityIds.join(",")})`)
    if (hotelIds.length) filters.push(`hotel_id.in.(${hotelIds.join(",")})`)
    const { count, error } = await supabaseAdmin
      .from("offers")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .or(filters.join(","))
    if (error) {
      console.error("getHostPendingOfferCount error:", error)
      return 0
    }
    return count || 0
  } catch (err) {
    console.error("getHostPendingOfferCount error:", err)
    return 0
  }
}

export async function getHostOffers() {
  const host = await currentHostRecord()
  if (!host) return []
  const { activityIds, hotelIds } = await listingIdsForHost(host.hostId, host.userId)
  if (activityIds.length === 0 && hotelIds.length === 0) return []
  await expireStaleAcceptedOffers()
  const filters: string[] = []
  if (activityIds.length) filters.push(`activity_id.in.(${activityIds.join(",")})`)
  if (hotelIds.length) filters.push(`hotel_id.in.(${hotelIds.join(",")})`)
  const { data, error } = await supabaseAdmin
    .from("offers")
    .select(
      "id, status, offer_amount, travel_date, guest_count, special_notes, created_at, payment_expires_at, guest_name, guest_email, guest_phone, activity_id, hotel_id, activities(id, title, slug, card_image_url, cover_image_url, category_type), hotels(id, title, slug, cover_image_url, gallery_urls)"
    )
    .or(filters.join(","))
    .order("created_at", { ascending: false })
  if (error) {
    console.error("getHostOffers error:", error)
    return []
  }
  return (data || []).map(mapHostOffer)
}

export async function respondToHostOffer(id: string, status: "accepted" | "declined") {
  const host = await currentHostRecord()
  if (!host) return { success: false, error: "Unauthorized" }
  if (status !== "accepted" && status !== "declined") {
    return { success: false, error: "Invalid status" }
  }
  const { activityIds, hotelIds } = await listingIdsForHost(host.hostId, host.userId)
  const { data: offer } = await supabaseAdmin
    .from("offers")
    .select("id, status, activity_id, hotel_id")
    .eq("id", id)
    .maybeSingle()
  if (!offer || offer.status !== "pending") {
    return { success: false, error: "This offer is no longer waiting." }
  }
  const owned =
    (offer.activity_id && activityIds.includes(offer.activity_id)) ||
    (offer.hotel_id && hotelIds.includes(offer.hotel_id))
  if (!owned) return { success: false, error: "Unauthorized" }

  return applyOfferDecision(id, status)
}
