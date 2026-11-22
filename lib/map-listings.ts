import type { MapTour } from "@/components/map/InteractiveMap"
import { getTourCoordinates } from "@/lib/utils/coordinates"

function listingType(row: { category_type?: string | null }) {
  if (row.category_type === "transport" || row.category_type === "hotel") return row.category_type
  return "tour"
}

export function toMapTours(rows: any[]): MapTour[] {
  return rows.flatMap((row) => {
    const type = listingType(row)
    const coords = getTourCoordinates(
      row.approx_lat != null ? Number(row.approx_lat) : null,
      row.approx_lng != null ? Number(row.approx_lng) : null,
      row.location || "",
      row.id
    )
    if (!coords) return []
    const fromCategories = Array.isArray(row.categories)
      ? row.categories.map((c: any) => c?.slug).filter(Boolean)
      : row.categories?.slug
        ? [row.categories.slug]
        : []
    const fromJoin = Array.isArray(row.activity_categories)
      ? row.activity_categories.map((join: any) => join?.categories?.slug).filter(Boolean)
      : []
    const tags = Array.from(new Set([...fromCategories, ...fromJoin, type]))
    return [
      {
        id: row.id,
        title: row.title,
        slug: row.slug,
        location: row.location || "",
        price_usd: Number(row.price_usd) || 0,
        cover_image_url: row.card_image_url || row.cover_image_url || "",
        duration: "",
        category: fromCategories[0] || type,
        category_type: type,
        tags,
        latitude: coords.lat,
        longitude: coords.lng,
        listingHref: row.listingHref || (type === "hotel" ? `/hotel/${row.slug}` : `/activity/${row.slug}`),
      },
    ]
  })
}
