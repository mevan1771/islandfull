"use server"

import { supabase } from "@/lib/supabase"
import {
  HOMEPAGE_PAGE_SIZE,
  type HomepageActivity,
  type HomepageActivityFilters,
} from "@/lib/homepage-feed"

const ACTIVITY_SELECT =
  "id, title, slug, location, duration, price_usd, price_suffix, discount_price, deal_end_date, card_image_url, cover_image_url, is_hidden_gem, pricing_model, max_capacity, pricing_tiers, allow_offers, is_featured, created_at, categories!inner(slug, name), reviews(rating)"

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
    allowOffers: !!d.allow_offers,
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

function applySort(query: any, filters: HomepageActivityFilters, usePopularity: boolean) {
  if (filters.sort === "price_asc") return query.order("price_usd", { ascending: true })
  if (filters.sort === "price_desc") return query.order("price_usd", { ascending: false })
  if (filters.sort === "deals") return query.order("discount_price", { ascending: true, nullsFirst: false })
  if (filters.sort === "newest" || !usePopularity) return query.order("created_at", { ascending: false })
  return query
    .order("popularity_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
}

async function fetchHomepageHotels(
  filters: HomepageActivityFilters,
  offset = 0,
  limit = HOMEPAGE_PAGE_SIZE
): Promise<{ activities: HomepageActivity[]; total: number }> {
  let query = supabase
    .from("hotels")
    .select("id, title, slug, location, cover_image_url, star_rating, property_type, allow_offers, hotel_room_types(nightly_rate_usd, is_active, max_occupancy)", { count: "exact" })
    .eq("status", "published")
    .eq("is_paused", false)

  if (filters.location) {
    const q = filters.location.toLowerCase().replace(/[^\p{L}\p{N}\s.,-]/gu, "").trim()
    if (q) query = query.or(`title.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`)
  }
  if (filters.category && filters.category !== "saved" && filters.category !== "all") {
    query = query.eq("property_type", filters.category)
  }
  if (filters.sort === "newest") query = query.order("created_at", { ascending: false })
  else query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false })

  const { data, error, count } = await query.range(offset, offset + limit - 1)
  if (error) {
    console.error("Hotels homepage query error:", error)
    return { activities: [], total: 0 }
  }

  return {
    total: count ?? 0,
    activities: (data || []).map((hotel: any) => {
      const rates = (hotel.hotel_room_types || [])
        .filter((room: any) => room.is_active)
        .map((room: any) => Number(room.nightly_rate_usd) || 0)
      const occupancy = (hotel.hotel_room_types || []).map((room: any) => Number(room.max_occupancy) || 0)
      return {
        id: hotel.id,
        title: hotel.title,
        slug: hotel.slug,
        location: hotel.location || "",
        duration: hotel.star_rating ? `${hotel.star_rating}★ hotel` : "Hotel",
        priceUsd: rates.length ? Math.min(...rates) : 0,
        price_suffix: " / night",
        discount_price: null,
        deal_end_date: null,
        coverImage: hotel.cover_image_url || "/placeholder.jpg",
        isHiddenGem: false,
        rating: undefined,
        reviewCount: 0,
        pricingModel: "flat_rate",
        maxGuests: occupancy.length ? Math.max(...occupancy) : 2,
        pricingTiers: null,
        allowOffers: !!hotel.allow_offers,
        listingHref: `/hotel/${hotel.slug}`,
      }
    }),
  }
}

export async function fetchHomepageActivities(
  filters: HomepageActivityFilters,
  offset = 0,
  limit = HOMEPAGE_PAGE_SIZE
): Promise<{ activities: HomepageActivity[]; total: number }> {
  if (filters.vertical === "hotel") {
    return fetchHomepageHotels(filters, offset, limit)
  }

  const countQuery = applySearchAndCategory(
    supabase.from("activities").select("id, categories!inner(slug)", { count: "exact", head: true }),
    filters
  )

  const run = (usePopularity: boolean) =>
    applySort(
      applySearchAndCategory(supabase.from("activities").select(ACTIVITY_SELECT), filters),
      filters,
      usePopularity
    ).range(offset, offset + limit - 1)

  let [{ data, error }, { count, error: countError }] = await Promise.all([run(true), countQuery])

  if (error && String(error.message || "").includes("popularity_score")) {
    const retry = await run(false)
    data = retry.data
    error = retry.error
  }

  if (error) console.error("Supabase query error:", error)
  if (countError) console.error("Supabase count error:", countError)

  return {
    activities: data ? data.map(mapActivity) : [],
    total: count ?? 0,
  }
}

export async function fetchMustSeePlaces(limit = 12) {
  const select =
    "id, title, slug, location, duration, cover_image_url, card_image_url"

  const run = (usePopularity: boolean) => {
    let query = supabase
      .from("activities")
      .select(select)
      .eq("category_type", "place")
      .eq("status", "published")
      .eq("is_paused_by_host", false)

    if (usePopularity) {
      query = query.order("popularity_score", { ascending: false, nullsFirst: false })
    }
    return query.order("created_at", { ascending: false }).limit(limit)
  }

  let { data, error } = await run(true)
  if (error && String(error.message || "").includes("popularity_score")) {
    const retry = await run(false)
    data = retry.data
    error = retry.error
  }

  if (error) {
    console.error("Failed to fetch must-see places:", error)
    return []
  }

  return (data || []).map((d: any) => ({
    id: d.id,
    title: d.title,
    slug: d.slug,
    location: d.location,
    duration: d.duration,
    coverImage: d.card_image_url || d.cover_image_url,
  }))
}
