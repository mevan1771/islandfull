import { createHmac, timingSafeEqual } from "crypto"

function secret() {
  return process.env.OFFER_ACTION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "islandfull-offer-links"
}

export function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "https://islandfull.com"
  ).replace(/\/$/, "")
}

export function offerActionToken(offerId: string, action: "accept" | "decline" | "pay") {
  return createHmac("sha256", secret()).update(`${offerId}:${action}`).digest("hex")
}

export function offerActionUrl(offerId: string, action: "accept" | "decline") {
  const token = offerActionToken(offerId, action)
  const params = new URLSearchParams({ id: offerId, action, token })
  return `${siteUrl()}/offers/review?${params.toString()}`
}

export function offerPayPath(offerId: string) {
  const token = offerActionToken(offerId, "pay")
  return `/offers/pay?id=${encodeURIComponent(offerId)}&token=${token}`
}

export function offerPayUrl(offerId: string) {
  return `${siteUrl()}${offerPayPath(offerId)}`
}

export function verifyOfferActionToken(offerId: string, action: string, token: string) {
  if (action !== "accept" && action !== "decline" && action !== "pay") return false
  if (!offerId || !token) return false
  const expected = offerActionToken(offerId, action as "accept" | "decline" | "pay")
  const a = Buffer.from(expected)
  const b = Buffer.from(token)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
