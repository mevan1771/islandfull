import { format, parse } from "date-fns"

export const TRIP_DATE_KEY = "date"
export const TRIP_GUESTS_KEY = "guests"
export const TRIP_CHILDREN_KEY = "children"
export const TRIP_INFANTS_KEY = "infants"
export const TRIP_STORAGE_KEY = "islandfull:trip-search"
export const TRIP_GUESTS_MAX = 20

export type TripSearch = {
  date: string
  guests: number
  children: number
  infants: number
}

export const emptyTripSearch = (): TripSearch => ({ date: "", guests: 0, children: 0, infants: 0 })

export function parseIsoDate(value: string | null | undefined): string {
  if (!value) return ""
  const trimmed = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return ""
  const parsed = parse(trimmed, "yyyy-MM-dd", new Date())
  return Number.isNaN(parsed.getTime()) ? "" : trimmed
}

export function parseCount(value: string | number | null | undefined, max = TRIP_GUESTS_MAX): number {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? "").trim(), 10)
  if (!Number.isFinite(n) || n < 0) return 0
  return Math.min(max, Math.floor(n))
}

export function parseGuestCount(value: string | number | null | undefined): number {
  const n = parseCount(value)
  return n < 1 ? 0 : n
}

export function occupyingGuests(trip: Pick<TripSearch, "guests" | "children">) {
  const children = Math.min(trip.children || 0, TRIP_GUESTS_MAX)
  const guests = trip.guests || 0
  return Math.max(guests, children)
}

export function adultsFromTrip(trip: Pick<TripSearch, "guests" | "children">) {
  const occupying = occupyingGuests(trip)
  return Math.max(0, occupying - (trip.children || 0))
}

export function clampGuests(n: number, min: number, max: number) {
  if (!n) return min
  return Math.min(max, Math.max(min, n))
}

export function normalizeTripSearch(partial: Partial<TripSearch>): TripSearch {
  const children = parseCount(partial.children)
  const infants = parseCount(partial.infants, 8)
  let guests = parseGuestCount(partial.guests)
  if (guests && children > guests) guests = children
  if (!guests && (children || infants)) guests = Math.max(1, children)
  return {
    date: parseIsoDate(partial.date),
    guests,
    children: guests ? Math.min(children, Math.max(0, guests - 1)) : 0,
    infants: guests ? infants : 0,
  }
}

export function setPartyCounts(
  current: TripSearch,
  patch: { adults?: number; children?: number; infants?: number }
): TripSearch {
  let adults = adultsFromTrip(current)
  let children = current.children
  let infants = current.infants
  if (patch.adults != null) adults = Math.max(1, Math.min(TRIP_GUESTS_MAX, patch.adults))
  if (patch.children != null) children = Math.max(0, Math.min(TRIP_GUESTS_MAX - 1, patch.children))
  if (patch.infants != null) infants = Math.max(0, Math.min(8, patch.infants))
  if (adults < 1) adults = 1
  if (adults + children > TRIP_GUESTS_MAX) {
    children = Math.max(0, TRIP_GUESTS_MAX - adults)
  }
  return {
    ...current,
    guests: adults + children,
    children,
    infants,
  }
}

export function readTripSearchFromParams(params: URLSearchParams | { get: (key: string) => string | null }): TripSearch {
  return normalizeTripSearch({
    date: params.get(TRIP_DATE_KEY) || "",
    guests: parseGuestCount(params.get(TRIP_GUESTS_KEY)),
    children: parseCount(params.get(TRIP_CHILDREN_KEY)),
    infants: parseCount(params.get(TRIP_INFANTS_KEY), 8),
  })
}

export function writeTripSearchToParams(params: URLSearchParams, trip: TripSearch) {
  if (trip.date) params.set(TRIP_DATE_KEY, trip.date)
  else params.delete(TRIP_DATE_KEY)
  if (trip.guests > 0) params.set(TRIP_GUESTS_KEY, String(trip.guests))
  else params.delete(TRIP_GUESTS_KEY)
  if (trip.children > 0) params.set(TRIP_CHILDREN_KEY, String(trip.children))
  else params.delete(TRIP_CHILDREN_KEY)
  if (trip.infants > 0) params.set(TRIP_INFANTS_KEY, String(trip.infants))
  else params.delete(TRIP_INFANTS_KEY)
  return params
}

export function withTripSearch(href: string, trip: TripSearch) {
  if (!href.startsWith("/activity/")) return href
  const url = new URL(href, "https://islandfull.com")
  writeTripSearchToParams(url.searchParams, trip)
  return `${url.pathname}${url.search}`
}

export function formatTripDateLabel(date: string, empty = "Add dates") {
  if (!date) return empty
  return format(parse(date, "yyyy-MM-dd", new Date()), "EEE d MMM")
}

export function formatGuestsLabel(trip: Pick<TripSearch, "guests" | "children" | "infants">, empty = "Add guests") {
  if (!trip.guests) return empty
  const adults = adultsFromTrip(trip)
  const parts: string[] = []
  if (adults) parts.push(adults === 1 ? "1 adult" : `${adults} adults`)
  if (trip.children) parts.push(trip.children === 1 ? "1 child" : `${trip.children} children`)
  if (trip.infants) parts.push(trip.infants === 1 ? "1 infant" : `${trip.infants} infants`)
  if (!trip.children && !trip.infants) {
    return trip.guests === 1 ? "1 guest" : `${trip.guests} guests`
  }
  return parts.join(", ")
}

export function partyNote(trip: Pick<TripSearch, "guests" | "children" | "infants">) {
  if (!trip.guests || (!trip.children && !trip.infants)) return ""
  const adults = adultsFromTrip(trip)
  const bits = [
    adults === 1 ? "1 adult" : `${adults} adults`,
    trip.children ? (trip.children === 1 ? "1 child (2–12)" : `${trip.children} children (2–12)`) : "",
    trip.infants ? (trip.infants === 1 ? "1 infant under 2 on a lap" : `${trip.infants} infants under 2 on laps`) : "",
  ].filter(Boolean)
  return `Party: ${bits.join(", ")}. Children take a seat and are billed as guests. Infants do not take a seat.`
}

export function loadTripSearch(): TripSearch {
  if (typeof window === "undefined") return emptyTripSearch()
  try {
    const raw = window.sessionStorage.getItem(TRIP_STORAGE_KEY)
    if (!raw) return emptyTripSearch()
    return normalizeTripSearch(JSON.parse(raw) as Partial<TripSearch>)
  } catch {
    return emptyTripSearch()
  }
}

export function saveTripSearch(trip: TripSearch) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(normalizeTripSearch(trip)))
  } catch {
    /* ignore quota */
  }
}
