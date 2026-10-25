import { DESTINATIONS } from "@/lib/destinations"
import { getDestinationGuide } from "@/lib/destinationGuides"
import { resolveCategoryIcon } from "@/lib/category-icons"

export type VehicleType = "car" | "van" | "bus" | "tuk-tuk" | "scooter"

export type RouteStop = {
  id: string
  name: string
  lat: number
  lng: number
  image?: string
  blurb?: string
}

const EXTRA_PLAN_STOPS: RouteStop[] = [
  {
    id: "negombo",
    name: "Negombo",
    lat: 7.2008,
    lng: 79.8737,
    image: "https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Beach town next to the airport",
  },
  {
    id: "dambulla",
    name: "Dambulla",
    lat: 7.8742,
    lng: 80.6517,
    image: "https://images.pexels.com/photos/322437/pexels-photo-322437.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Cave temples on the cultural triangle",
  },
  {
    id: "anuradhapura",
    name: "Anuradhapura",
    lat: 8.3114,
    lng: 80.4037,
    image: "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Ancient capital and dagobas",
  },
  {
    id: "polonnaruwa",
    name: "Polonnaruwa",
    lat: 7.9403,
    lng: 81.0188,
    image: "https://images.pexels.com/photos/35606860/pexels-photo-35606860.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Ruined city and Gal Vihara",
  },
  {
    id: "bentota",
    name: "Bentota",
    lat: 6.4211,
    lng: 79.9959,
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "River and west-coast beach",
  },
  {
    id: "unawatuna",
    name: "Unawatuna",
    lat: 6.0174,
    lng: 80.2489,
    image: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Bay beach south of Galle",
  },
  {
    id: "tangalle",
    name: "Tangalle",
    lat: 6.024,
    lng: 80.797,
    image: "https://images.pexels.com/photos/7400676/pexels-photo-7400676.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Quiet south-coast beaches",
  },
  {
    id: "jaffna",
    name: "Jaffna",
    lat: 9.6615,
    lng: 80.0255,
    image: "https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Northern peninsula and lagoon",
  },
]

export const ROUTE_STOPS: RouteStop[] = [
  {
    id: "cmb",
    name: "Colombo Airport (CMB)",
    lat: 7.1808,
    lng: 79.8841,
    image: "https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg?auto=compress&cs=tinysrgb&w=800",
    blurb: "Pickup at Bandaranaike arrivals",
  },
  ...DESTINATIONS.map((d) => ({
    id: d.name.trim().toLowerCase().replace(/\s+/g, "-"),
    name: d.name,
    lat: d.coordinates.lat,
    lng: d.coordinates.lng,
    image: d.image,
    blurb: getDestinationGuide(d.name)?.tagline,
  })),
  ...EXTRA_PLAN_STOPS,
]

export const VEHICLE_ORDER: VehicleType[] = ["car", "van", "bus", "tuk-tuk", "scooter"]

export const VEHICLE_RATES: Record<
  VehicleType,
  { perKm: number; min: number; maxGuests: number; label: string; icon: string }
> = {
  car: { perKm: 0.42, min: 28, maxGuests: 4, label: "Car", icon: resolveCategoryIcon({ slug: "car" }) || "" },
  van: { perKm: 0.68, min: 48, maxGuests: 8, label: "Van", icon: resolveCategoryIcon({ slug: "van" }) || "" },
  bus: { perKm: 0.95, min: 80, maxGuests: 20, label: "Bus", icon: resolveCategoryIcon({ slug: "bus" }) || "" },
  "tuk-tuk": {
    perKm: 0.28,
    min: 18,
    maxGuests: 3,
    label: "Tuk-tuk",
    icon: resolveCategoryIcon({ slug: "tuk-tuk" }) || "",
  },
  scooter: {
    perKm: 0.22,
    min: 14,
    maxGuests: 2,
    label: "Scooter",
    icon: resolveCategoryIcon({ slug: "scooter" }) || "",
  },
}

export const GUIDE_FEE_USD = 40

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(s)))
}

export function routeDistanceKm(stops: RouteStop[]) {
  if (stops.length < 2) return 0
  let km = 0
  for (let i = 1; i < stops.length; i++) km += haversineKm(stops[i - 1], stops[i])
  return Math.round(km)
}

export function guidePriceUsd(km: number, vehicle: VehicleType, withGuide = false) {
  const rate = VEHICLE_RATES[vehicle]
  const ride = Math.max(rate.min, Math.round(km * rate.perKm))
  return withGuide ? ride + GUIDE_FEE_USD : ride
}

export function routeLabel(stops: { name: string }[]) {
  return stops.map((stop) => stop.name.replace("Colombo Airport (CMB)", "CMB")).join(" → ")
}

export function stopById(id: string) {
  return ROUTE_STOPS.find((stop) => stop.id === id) || null
}
