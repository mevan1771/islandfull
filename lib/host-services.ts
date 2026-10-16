export const HOST_SERVICE_TYPES = [
  { id: "tour", label: "Tours" },
  { id: "transport", label: "Transport" },
  { id: "hotel", label: "Hotels" },
] as const

export type HostServiceType = (typeof HOST_SERVICE_TYPES)[number]["id"]

const ALLOWED = new Set(HOST_SERVICE_TYPES.map((item) => item.id))

export function parseServiceTypes(raw: unknown): HostServiceType[] {
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : []
  const unique = [...new Set(list.map(String).filter((id): id is HostServiceType => ALLOWED.has(id as HostServiceType)))]
  return unique.length ? unique : ["tour"]
}

export function hostOffers(host: { service_types?: unknown } | null | undefined, type: HostServiceType) {
  const types = parseServiceTypes(host?.service_types)
  return types.includes(type)
}

export type HostListingCounts = {
  tour: number
  transport: number
  hotel: number
}

export const HOST_LISTING_BUBBLES: {
  id: keyof HostListingCounts
  one: string
  many: string
  className: string
}[] = [
  { id: "tour", one: "tour", many: "tours", className: "bg-rose-50 text-rose-600 border-rose-200" },
  { id: "transport", one: "transport", many: "transport", className: "bg-amber-50 text-amber-800 border-amber-200" },
  { id: "hotel", one: "hotel", many: "hotels", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
]

export function emptyListingCounts(): HostListingCounts {
  return { tour: 0, transport: 0, hotel: 0 }
}

export function countsFromListings(
  activities: { category_type?: string | null }[] | null | undefined,
  hotels: unknown[] | null | undefined
): HostListingCounts {
  const rows = Array.isArray(activities) ? activities : []
  return {
    tour: rows.filter((row) => (row.category_type || "tour") === "tour").length,
    transport: rows.filter((row) => row.category_type === "transport").length,
    hotel: Array.isArray(hotels) ? hotels.length : 0,
  }
}
