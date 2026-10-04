"use server"

import { supabase } from "@/lib/supabase"
import {
  HOMEPAGE_PAGE_SIZE,
  type HomepageActivity,
  type HomepageActivityFilters,
} from "@/lib/homepage-feed"

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

function applySort(query: any, filters: HomepageActivityFilters, usePopularity: boolean) {
  if (filters.sort === "price_asc") return query.order("price_usd", { ascending: true })
  if (filters.sort === "price_desc") return query.order("price_usd", { ascending: false })
  if (filters.sort === "deals") return query.order("discount_price", { ascending: true, nullsFirst: false })
  if (filters.sort === "newest" || !usePopularity) return query.order("created_at", { ascending: false })
  return query
    .order("popularity_score", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
}

export async function fetchHomepageActivities(
  filters: HomepageActivityFilters,
  offset = 0,
  limit = HOMEPAGE_PAGE_SIZE
): Promise<{ activities: HomepageActivity[]; total: number }> {
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
