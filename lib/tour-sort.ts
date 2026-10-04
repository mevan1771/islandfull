export const TOUR_SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
] as const

export type TourSort = (typeof TOUR_SORT_OPTIONS)[number]["value"]

export function parseTourSort(value: string | null | undefined): TourSort {
  if (value === "price_asc" || value === "price_desc" || value === "newest") return value
  return "recommended"
}

export function sortTours<T extends { price_usd: number; created_at?: string | null; popularity_score?: number | null }>(
  tours: T[],
  sort: TourSort
) {
  const copy = [...tours]
  copy.sort((a, b) => {
    if (sort === "price_asc") return (a.price_usd || 0) - (b.price_usd || 0)
    if (sort === "price_desc") return (b.price_usd || 0) - (a.price_usd || 0)
    if (sort === "newest") {
      return Date.parse(b.created_at || "") - Date.parse(a.created_at || "")
    }
    const score = (b.popularity_score || 0) - (a.popularity_score || 0)
    if (score !== 0) return score
    return Date.parse(b.created_at || "") - Date.parse(a.created_at || "")
  })
  return copy
}
