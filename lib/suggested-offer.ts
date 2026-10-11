/** ~10% below list price, rounded down to a clean figure so guests start below the rack rate. */
export function suggestedOfferAmount(listPrice: number): number {
  const price = Number(listPrice)
  if (!Number.isFinite(price) || price <= 0) return 0

  const raw = price * 0.9
  const step = price >= 50 ? 5 : 1
  let suggested = Math.floor(raw / step) * step

  if (suggested >= price) {
    suggested = Math.max(step, price - step)
  }
  if (suggested < 1) suggested = 1
  return suggested
}
