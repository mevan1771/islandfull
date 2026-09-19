export type PricingTier = { guestCount: number; price: number }

function toNumber(value: unknown) {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""))
  return Number.isFinite(n) ? n : null
}

export function parsePricingTiers(raw: unknown): PricingTier[] {
  if (!raw) return []

  if (Array.isArray(raw)) {
    return raw
      .map((row) => {
        const guestCount = toNumber(row?.guestCount ?? row?.guests ?? row?.min_guests ?? row?.size)
        const price = toNumber(row?.price ?? row?.total ?? row?.total_price ?? row?.flat_price)
        if (!guestCount || guestCount <= 0 || price === null) return null
        return { guestCount, price }
      })
      .filter((tier): tier is PricingTier => Boolean(tier))
  }

  if (typeof raw === "object") {
    return Object.entries(raw as Record<string, unknown>)
      .map(([guestCountStr, priceValue]) => {
        const guestCount = toNumber(guestCountStr)
        const price = toNumber(priceValue)
        if (!guestCount || guestCount <= 0 || price === null) return null
        return { guestCount, price }
      })
      .filter((tier): tier is PricingTier => Boolean(tier))
  }

  return []
}

export function hasPricingTiers(raw: unknown) {
  return parsePricingTiers(raw).length > 0
}

/** Lowest per-person rate from the largest group tier (flat total / guests). */
export function getLowestPerPersonFromTiers(raw: unknown): number | null {
  const tiers = parsePricingTiers(raw)
  if (tiers.length === 0) return null

  const highestTier = tiers.reduce((best, tier) =>
    tier.guestCount > best.guestCount ? tier : best
  )

  return highestTier.price / highestTier.guestCount
}

/** Highest applicable group-size override for the current guest count. */
export function getMatchingTierPrice(guestCount: number, raw: unknown): number | null {
  const tiers = parsePricingTiers(raw).sort((a, b) => b.guestCount - a.guestCount)
  const match = tiers.find((tier) => guestCount >= tier.guestCount)
  return match ? match.price : null
}
