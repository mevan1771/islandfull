export const OFFER_PAY_HOURS = 24
export const OFFER_PAY_WINDOW_MS = OFFER_PAY_HOURS * 60 * 60 * 1000

export type PayUrgency = "gold" | "amber" | "red" | "expired"

export function offerMsLeft(expiresAt?: string | null, now = Date.now()) {
  if (!expiresAt) return null
  const end = new Date(expiresAt).getTime()
  if (Number.isNaN(end)) return null
  return end - now
}

export function payUrgency(ms: number | null): PayUrgency {
  if (ms == null) return "gold"
  if (ms <= 0) return "expired"
  const hours = ms / (60 * 60 * 1000)
  if (hours <= 1) return "red"
  if (hours <= 6) return "amber"
  return "gold"
}

export function formatPayRemaining(ms: number | null) {
  if (ms == null) return ""
  if (ms <= 0) return "Expired"
  const total = Math.floor(ms / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (hours >= 1) return `${hours}h ${String(minutes).padStart(2, "0")}m`
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

export function formatPayRing(ms: number | null) {
  if (ms == null || ms <= 0) return { main: "0", sub: "00s" }
  const total = Math.floor(ms / 1000)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  if (hours >= 1) return { main: `${hours}h`, sub: `${String(minutes).padStart(2, "0")}m` }
  return { main: String(minutes), sub: `${String(seconds).padStart(2, "0")}s` }
}

export function payWindowProgress(ms: number | null) {
  if (ms == null) return 1
  return Math.max(0, Math.min(1, ms / OFFER_PAY_WINDOW_MS))
}

/** Accepted offers with no deadline (legacy) or a deadline that has passed are not payable. */
export function isAcceptedOfferLive(offer: { status?: string; payment_expires_at?: string | null }, now = Date.now()) {
  if (offer.status !== "accepted") return false
  const ms = offerMsLeft(offer.payment_expires_at, now)
  return ms != null && ms > 0
}
