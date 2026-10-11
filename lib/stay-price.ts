/** Days should multiply the rate for per-day pricing and for transport rentals. */
export function chargesByDay(
  pricingModel?: string,
  categoryType?: string,
  bookingType?: string
) {
  return (
    pricingModel === "per_day" ||
    (categoryType === "transport" && bookingType !== "point_to_point")
  )
}

export function chargesByGuest(pricingModel?: string) {
  return pricingModel !== "per_day" && pricingModel !== "flat_rate"
}

export function stayListTotal({
  unitPrice,
  guests,
  days,
  pricingModel,
  categoryType,
  bookingType,
}: {
  unitPrice: number
  guests: number
  days: number
  pricingModel?: string
  categoryType?: string
  bookingType?: string
}) {
  const guestMultiplier = chargesByGuest(pricingModel) ? Math.max(1, guests) : 1
  const dayMultiplier = chargesByDay(pricingModel, categoryType, bookingType)
    ? Math.max(1, days)
    : 1
  return Math.max(0, Number(unitPrice) || 0) * guestMultiplier * dayMultiplier
}

export function stayUnitFromTotal({
  total,
  guests,
  days,
  pricingModel,
  categoryType,
  bookingType,
}: {
  total: number
  guests: number
  days: number
  pricingModel?: string
  categoryType?: string
  bookingType?: string
}) {
  const guestMultiplier = chargesByGuest(pricingModel) ? Math.max(1, guests) : 1
  const dayMultiplier = chargesByDay(pricingModel, categoryType, bookingType)
    ? Math.max(1, days)
    : 1
  const denom = guestMultiplier * dayMultiplier
  if (denom <= 0) return 0
  return (Number(total) || 0) / denom
}

export function stayRateSuffix(pricingModel?: string, categoryType?: string, bookingType?: string) {
  const byGuest = chargesByGuest(pricingModel)
  const byDay = chargesByDay(pricingModel, categoryType, bookingType)
  if (byGuest && byDay) return "per person / day"
  if (byGuest) return "per person"
  if (byDay) return "per day"
  return "total"
}

export function formatStayMoney(amount: number) {
  const value = Math.round((Number(amount) || 0) * 100) / 100
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value)
}
