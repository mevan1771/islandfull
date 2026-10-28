import { format, parse } from "date-fns"

export const TRIP_DATE_KEY = "date"
export const TRIP_GUESTS_KEY = "guests"
export const TRIP_STORAGE_KEY = "islandfull:trip-search"
export const TRIP_GUESTS_MAX = 20

export type TripSearch = {
  date: string
  guests: number
}

export const emptyTripSearch = (): TripSearch => ({ date: "", guests: 0 })

export function parseIsoDate(value: string | null | undefined): string {
  if (!value) return ""
  const trimmed = value.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return ""
  const parsed = parse(trimmed, "yyyy-MM-dd", new Date())
  return Number.isNaN(parsed.getTime()) ? "" : trimmed
}

export function parseGuestCount(value: string | number | null | undefined): number {
  const n = typeof value === "number" ? value : Number.parseInt(String(value ?? "").trim(), 10)
  if (!Number.isFinite(n) || n < 1) return 0
  return Math.min(TRIP_GUESTS_MAX, Math.floor(n))
}

export function clampGuests(n: number, min: number, max: number) {
  if (!n) return min
  return Math.min(max, Math.max(min, n))
}

export function readTripSearchFromParams(params: URLSearchParams | { get: (key: string) => string | null }): TripSearch {
  return {
    date: parseIsoDate(params.get(TRIP_DATE_KEY)),
    guests: parseGuestCount(params.get(TRIP_GUESTS_KEY)),
  }
}

export function writeTripSearchToParams(params: URLSearchParams, trip: TripSearch) {
  if (trip.date) params.set(TRIP_DATE_KEY, trip.date)
  else params.delete(TRIP_DATE_KEY)
  if (trip.guests > 0) params.set(TRIP_GUESTS_KEY, String(trip.guests))
  else params.delete(TRIP_GUESTS_KEY)
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

export function formatGuestsLabel(guests: number, empty = "Add guests") {
  if (!guests) return empty
  return guests === 1 ? "1 guest" : `${guests} guests`
}

export function loadTripSearch(): TripSearch {
  if (typeof window === "undefined") return emptyTripSearch()
  try {
    const raw = window.sessionStorage.getItem(TRIP_STORAGE_KEY)
    if (!raw) return emptyTripSearch()
    const parsed = JSON.parse(raw) as Partial<TripSearch>
    return {
      date: parseIsoDate(parsed.date),
      guests: parseGuestCount(parsed.guests),
    }
  } catch {
    return emptyTripSearch()
  }
}

export function saveTripSearch(trip: TripSearch) {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.setItem(TRIP_STORAGE_KEY, JSON.stringify(trip))
  } catch {
    /* ignore quota */
  }
}
