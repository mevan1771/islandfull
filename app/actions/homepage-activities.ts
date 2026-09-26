"use server"

import { supabase } from "@/lib/supabase"

export const HOMEPAGE_PAGE_SIZE = 24

export type HomepageActivity = {
  id: string
  title: string
  slug: string
  location: string
  duration: string
  priceUsd: number
  price_suffix: string | null
  discount_price: number | null
  deal_end_date: string | null
  coverImage: string
  isHiddenGem: boolean
  rating?: number
  reviewCount: number
  pricingModel: string
  maxGuests: number
  pricingTiers: unknown
}

export type HomepageActivityFilters = {
  vertical?: string
  category?: string
  location?: string
  sort?: string
}

const ACTIVITY_SELECT =
  "id, title, slug, location, duration, price_usd, price_suffix, discount_price, deal_end_date, card_image_url, cover_image_url, is_hidden_gem, pricing_model, max_capacity, pricing_tiers, is_featured, created_at, categories!inner(slug, name), reviews(rating)"

function mapActivity(d: any): HomepageActivity {
  const rating =
    d.reviews && d.reviews.length > 0
      ? d.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / d.reviews.length
      : undefined

  return {
    id: d.id,
    title: d.title,
    slug: d.slug,
    location: d.location,
    duration: d.duration,
    priceUsd: d.price_usd,
    price_suffix: d.price_suffix,
    discount_price: d.discount_price,
    deal_end_date: d.deal_end_date,
    coverImage: d.card_image_url || d.cover_image_url,
    isHiddenGem: d.is_hidden_gem,
    rating,
    reviewCount: d.reviews ? d.reviews.length : 0,
    pricingModel: d.pricing_model,
    maxGuests: d.max_capacity,
    pricingTiers: d.pricing_tiers,
  }
}

function applySearchAndCategory(query: any, filters: HomepageActivityFilters) {
  let next = query
    .eq("category_type", filters.vertical || "tour")
    .eq("status", "published")
    .eq("is_paused_by_host", false)

  if (filters.location) {
    let q = filters.location.toLowerCase().replace(/[^\p{L}\p{N}\s.,-]/gu, "").trim()
    if (q) {
      if (q.endsWith("ies")) q = q.slice(0, -3) + "y"
      else if (q.endsWith("es")) q = q.slice(0, -2)
      else if (q.endsWith("s") && !q.endsWith("ss")) q = q.slice(0, -1)
      next = next.or(`title.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`)
    }
  }

  if (filters.category && filters.category !== "saved" && filters.category !== "all") {
    next = next.eq("categories.slug", filters.category)
  }

  return next
}

export async function fetchHomepageActivities(
  filters: HomepageActivityFilters,
  offset = 0,
  limit = HOMEPAGE_PAGE_SIZE
): Promise<{ activities: HomepageActivity[]; total: number }> {
  let dataQuery: any = applySearchAndCategory(
    supabase.from("activities").select(ACTIVITY_SELECT),
    filters
  )

  if (filters.sort === "price_asc") {
    dataQuery = dataQuery.order("price_usd", { ascending: true })
  } else if (filters.sort === "price_desc") {
    dataQuery = dataQuery.order("price_usd", { ascending: false })
  } else if (filters.sort === "deals") {
    dataQuery = dataQuery.order("discount_price", { ascending: true, nullsFirst: false })
  } else {
    dataQuery = dataQuery.order("is_featured", { ascending: false, nullsFirst: false })
    dataQuery = dataQuery.order("created_at", { ascending: false })
  }

  const countQuery = applySearchAndCategory(
    supabase.from("activities").select("id, categories!inner(slug)", { count: "exact", head: true }),
    filters
  )

  const [{ data, error }, { count, error: countError }] = await Promise.all([
    dataQuery.range(offset, offset + limit - 1),
    countQuery,
  ])

  if (error) console.error("Supabase query error:", error)
  if (countError) console.error("Supabase count error:", countError)

  return {
    activities: data ? data.map(mapActivity) : [],
    total: count ?? 0,
  }
}
