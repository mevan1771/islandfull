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
