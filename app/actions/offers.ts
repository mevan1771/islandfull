"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/utils/supabase/server"
import { offerActionUrl, siteUrl, verifyOfferActionToken } from "@/lib/offer-token"
import { formatIsoRangeWithDays, inclusiveDays, travelRangeFromOffer } from "@/lib/date-range-label"
import { stayListTotal } from "@/lib/stay-price"
import { parseISO } from "date-fns"

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
  activityId: string
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
    const travelLabel = formatIsoRangeWithDays(travelDate, travelEndDate || null)

    if (!input.activityId || !guestName || !EMAIL_RE.test(guestEmail) || !travelDate || !Number.isFinite(offerAmount) || offerAmount <= 0) {
      return { success: false, error: "Please fill in your name, a valid email, travel date, and offer amount." }
    }

    const { data: activity, error: activityError } = await supabaseAdmin
      .from("activities")
      .select("id, title, slug, price_usd, allow_offers, min_guests, max_capacity, status, category_type, pricing_model, booking_type, hosts(email)")
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

    const minGuests = activity.min_guests || 1
    const maxGuests = activity.max_capacity || 20
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
        activity_id: activity.id,
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

    const host = rel(activity.hosts as { email?: string } | { email?: string }[] | null)
    sendOfferCreatedEmails({
      offerId: offer.id,
      guestName,
      guestEmail,
      guestPhone,
      offerAmount,
      travelDate: travelLabel,
      guestCount: boundedGuests,
      specialNotes: userNotes,
      activityTitle: activity.title,
      activitySlug: activity.slug,
      basePrice: stayListTotal({
        unitPrice: Number(activity.price_usd) || 0,
        guests: boundedGuests,
        days: travelEndDate ? inclusiveDays(parseISO(travelDate), parseISO(travelEndDate)) : 1,
        pricingModel: activity.pricing_model,
        categoryType: activity.category_type,
        bookingType: activity.booking_type,
      }),
      hostEmail: host?.email || null,
    }).catch((err) => console.error("Offer email failed:", err))

    revalidatePath("/admin/offers")
    return { success: true, offerId: offer.id }
  } catch (err: any) {
    console.error("createOffer error:", err)
    return { success: false, error: "Could not send your offer. Please try again." }
  }
}

function offerDetailsHtml(props: {
  guestName: string
  guestEmail: string
  guestPhone: string | null
  offerAmount: number
  travelDate: string
  guestCount: number
  specialNotes: string | null
  activityTitle: string
  basePrice: number
}) {
  return `
    <p><strong>Listing:</strong> ${props.activityTitle}</p>
    <p><strong>List price:</strong> $${props.basePrice.toFixed(2)}</p>
    <p><strong>Offered price:</strong> $${props.offerAmount.toFixed(2)}</p>
    <p><strong>Travel dates:</strong> ${props.travelDate}</p>
    <p><strong>Guests:</strong> ${props.guestCount}</p>
    <p><strong>Guest name:</strong> ${props.guestName}</p>
    <p><strong>Email:</strong> ${props.guestEmail}</p>
    ${props.guestPhone ? `<p><strong>Phone:</strong> ${props.guestPhone}</p>` : ""}
    ${props.specialNotes ? `<p><strong>Notes:</strong> ${props.specialNotes}</p>` : ""}
  `
}

async function sendOfferCreatedEmails(props: {
  offerId: string
  guestName: string
  guestEmail: string
  guestPhone: string | null
  offerAmount: number
  travelDate: string
  guestCount: number
  specialNotes: string | null
  activityTitle: string
  activitySlug: string | null
  basePrice: number
  hostEmail: string | null
}) {
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)
  const details = offerDetailsHtml(props)
  const acceptUrl = offerActionUrl(props.offerId, "accept")
  const declineUrl = offerActionUrl(props.offerId, "decline")
  const hostTo = Array.from(new Set([ADMIN_INBOX, props.hostEmail].filter(Boolean))) as string[]

  await Promise.allSettled([
    resend.emails.send({
      from: "IslandFull <info@islandfull.com>",
      replyTo: ADMIN_INBOX,
      to: [props.guestEmail],
      subject: `We received your offer: ${props.activityTitle}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Offer received</h2>
        <p>Hi ${props.guestName},</p>
        <p>Thanks for your offer. We’ll review availability and email you when the host responds. No payment is needed yet.</p>
        ${details}
        <p>Best,<br>IslandFull</p>
      </div>`,
    }),
    resend.emails.send({
      from: "IslandFull <info@islandfull.com>",
      replyTo: props.guestEmail,
      to: hostTo,
      subject: `New offer: ${props.activityTitle} — $${props.offerAmount.toFixed(2)}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>New offer</h2>
        ${details}
        <p style="margin:28px 0 12px;">Tap a button to respond. You’ll confirm on the next page so the offer isn’t actioned by accident.</p>
        <p>
          <a href="${acceptUrl}" style="display:inline-block;padding:14px 22px;background:#059669;color:#ffffff;border-radius:10px;text-decoration:none;font-weight:700;margin-right:10px;">Accept Offer</a>
          <a href="${declineUrl}" style="display:inline-block;padding:14px 22px;background:#18181b;color:#ffffff;border-radius:10px;text-decoration:none;font-weight:700;">Decline Offer</a>
        </p>
        <p style="color:#71717a;font-size:13px;">You can also review it in Admin → Offers.</p>
      </div>`,
    }),
  ])
}

async function sendGuestDecisionEmail(offer: {
  guest_name: string
  guest_email: string
  offer_amount: number
  travel_date: string
  special_notes?: string | null
  status: string
  activities?: { title?: string; slug?: string } | { title?: string; slug?: string }[] | null
}) {
  const listing = rel(offer.activities)
  const title = listing?.title || "your trip"
  const slug = listing?.slug
  const listingUrl = slug ? `${siteUrl()}/activity/${slug}` : siteUrl()
  const travelLabel = travelRangeFromOffer(offer.travel_date, offer.special_notes)
  const { Resend } = await import("resend")
  const resend = new Resend(process.env.RESEND_API_KEY)

  if (offer.status === "accepted") {
    await resend.emails.send({
      from: "IslandFull <info@islandfull.com>",
      replyTo: ADMIN_INBOX,
      to: [offer.guest_email],
      subject: `Great news — your offer for ${title} was accepted`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Your offer was accepted</h2>
        <p>Hi ${offer.guest_name},</p>
        <p>Great news! Your offer of $${Number(offer.offer_amount).toFixed(2)} for <strong>${title}</strong> on ${travelLabel} was accepted.</p>
        <p>Please open the listing to complete your reservation and arrange payment:</p>
        <p><a href="${listingUrl}" style="display:inline-block;padding:14px 22px;background:#f43f5e;color:#ffffff;border-radius:10px;text-decoration:none;font-weight:700;">Complete reservation</a></p>
        <p>Best,<br>IslandFull</p>
      </div>`,
    })
    return
  }

  if (offer.status === "declined") {
    await resend.emails.send({
      from: "IslandFull <info@islandfull.com>",
      replyTo: ADMIN_INBOX,
      to: [offer.guest_email],
      subject: `Update on your offer for ${title}`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Offer update</h2>
        <p>Hi ${offer.guest_name},</p>
        <p>Thanks for offering on <strong>${title}</strong>. The host couldn’t accept this price this time.</p>
        <p>You’re welcome to browse other dates or listings, or send a new offer.</p>
        <p><a href="${listingUrl}">View listing</a></p>
        <p>Best,<br>IslandFull</p>
      </div>`,
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
    .select("id, status, guest_name, guest_email, offer_amount, travel_date, special_notes, activities(title, slug)")
    .eq("id", id)
    .maybeSingle()

  if (!offer || offer.status !== "pending") {
    redirect("/offers/processed?status=invalid")
  }

  const status = action === "accept" ? "accepted" : "declined"
  const { error } = await supabaseAdmin
    .from("offers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending")

  if (error) {
    console.error("confirmOfferFromEmail error:", error)
    redirect("/offers/processed?status=invalid")
  }

  sendGuestDecisionEmail({ ...offer, status }).catch((err) => console.error("Guest decision email failed:", err))
  revalidatePath("/admin/offers")
  redirect(`/offers/processed?status=${status === "accepted" ? "accepted" : "declined"}`)
}

export async function getOffers() {
  const { data, error } = await supabaseAdmin
    .from("offers")
    .select("*, activities(id, title, price_usd, category_type, slug)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getOffers error:", error)
    return []
  }
  return data || []
}

export async function updateOfferStatus(
  id: string,
  status: "accepted" | "declined" | "countered",
  adminCounterAmount?: number | null
) {
  const ok = await requireAdmin()
  if (!ok) return { success: false, error: "Unauthorized" }

  if (!["accepted", "declined", "countered"].includes(status)) {
    return { success: false, error: "Invalid status" }
  }

  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
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
    .select("guest_name, guest_email, offer_amount, travel_date, special_notes, status, activities(title, slug)")
    .single()

  if (error) {
    console.error("updateOfferStatus error:", error)
    return { success: false, error: "Could not update offer." }
  }

  if (offer && (status === "accepted" || status === "declined")) {
    sendGuestDecisionEmail(offer).catch((err) => console.error("Guest decision email failed:", err))
  }

  revalidatePath("/admin/offers")
  return { success: true }
}
