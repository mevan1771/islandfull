"use server"

import { supabase } from "@/lib/supabase"
import type { HomepageActivity } from "@/lib/homepage-feed"

const SELECT =
  "id, title, slug, location, duration, price_usd, price_suffix, discount_price, deal_end_date, card_image_url, cover_image_url, is_hidden_gem, pricing_model, max_capacity, pricing_tiers, reviews(rating)"

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

export async function fetchActivitiesByIds(ids: string[]): Promise<HomepageActivity[]> {
  const unique = [...new Set(ids.filter(Boolean))].slice(0, 80)
  if (unique.length === 0) return []

  const { data, error } = await supabase
    .from("activities")
    .select(SELECT)
    .in("id", unique)
    .eq("status", "published")
    .eq("is_paused_by_host", false)

  if (error) {
    console.error("Wishlist fetch error:", error)
    return []
  }

  const mapped = (data || []).map(mapActivity)
  const order = new Map(unique.map((id, i) => [id, i]))
  return mapped.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
}

export async function fetchRecommendedTours(excludeIds: string[] = []): Promise<HomepageActivity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select(SELECT)
    .eq("category_type", "tour")
    .eq("status", "published")
    .eq("is_paused_by_host", false)
    .order("is_featured", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(12)

  if (error) {
    console.error("Recommended tours fetch error:", error)
    return []
  }

  const skip = new Set(excludeIds)
  return (data || []).map(mapActivity).filter((a) => !skip.has(a.id)).slice(0, 8)
}
