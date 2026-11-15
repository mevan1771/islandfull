import { unstable_cache } from "next/cache"
import { supabase } from "@/lib/supabase"
import {
  PUBLIC_VERTICALS,
  emptyHomepageCategoryMap,
  publicVertical,
  type HomepageCategoryMap,
  type PublicVertical,
} from "@/lib/homepage-feed"

const HERO_TOUR_COLUMNS =
  "id, title, slug, location, cover_image_url, card_image_url, use_dark_text_desktop, use_dark_text_mobile, price_usd, price_suffix, discount_price, deal_end_date, pricing_model, pricing_tiers, category_type, approx_lat, approx_lng"

const MAP_LISTING_COLUMNS =
  "id, title, slug, location, cover_image_url, card_image_url, price_usd, price_suffix, discount_price, deal_end_date, pricing_model, pricing_tiers, category_type, approx_lat, approx_lng"

function hotelListing(hotel: any) {
  const rates = (hotel.hotel_room_types || [])
    .filter((room: any) => room.is_active)
    .map((room: any) => Number(room.nightly_rate_usd) || 0)
    .filter((rate: number) => rate > 0)
  return {
    id: hotel.id,
    title: hotel.title,
    slug: hotel.slug,
    location: hotel.location,
    cover_image_url: hotel.cover_image_url,
    price_usd: rates.length ? Math.min(...rates) : 0,
    category_type: "hotel",
    listingHref: `/hotel/${hotel.slug}`,
    approx_lat: hotel.latitude,
    approx_lng: hotel.longitude,
  }
}

export type HomepageHeroPayload = {
  featuredTours: any[]
  introSlide: any
  featuredSpotlight: any
  mapListings: any[]
}

function withActivityHref(row: any) {
  return { ...row, listingHref: `/activity/${row.slug}` }
}

function listingType(row: { category_type?: string | null }) {
  if (row.category_type === "transport" || row.category_type === "hotel") return row.category_type
  return "tour"
}

function pickFallback(rows: any[], limit: number) {
  return rows.slice(0, limit)
}

export function assembleHero(payload: HomepageHeroPayload, vertical: PublicVertical) {
  const mapListings = payload.mapListings.filter((row) => listingType(row) === vertical)
  let featured = (payload.featuredTours || []).filter((row) => listingType(row) === vertical)
  if (!featured.length) featured = pickFallback(mapListings, vertical === "hotel" ? 3 : 3)

  const introSlide =
    vertical === "tour" && payload.introSlide
      ? {
          id: "static-intro",
          title: payload.introSlide.title ?? "Your Journey in Sri Lanka Begins Here",
          subtitle: payload.introSlide.subtitle ?? "Inspiration, planning, and booking—all in one place.",
          slug: "",
          cover_image_url:
            payload.introSlide.cover_image_url ||
            "https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
          isStatic: true,
          use_dark_text_desktop: payload.introSlide.use_dark_text_desktop || payload.introSlide.useDarkText || false,
          use_dark_text_mobile: payload.introSlide.use_dark_text_mobile || payload.introSlide.useDarkText || false,
        }
      : null

  return {
    carouselSlides: introSlide ? [introSlide, ...featured] : featured,
    mapListings,
    featuredSpotlight: payload.featuredSpotlight,
  }
}

async function fetchHomepageHeroData(): Promise<HomepageHeroPayload> {
  const [spotlightRes, featuredRes, introRes, activitiesRes, hotelsRes, featuredHotelsRes] = await Promise.all([
    supabase.from("global_settings").select("value").eq("key", "featured_spotlight").maybeSingle(),
    supabase
      .from("activities")
      .select(HERO_TOUR_COLUMNS)
      .eq("status", "published")
      .eq("is_paused_by_host", false)
      .neq("category_type", "place")
      .neq("category_type", "event")
      .eq("is_featured", true)
      .order("featured_order", { ascending: true })
      .limit(12),
    supabase.from("global_settings").select("value").eq("key", "hero_intro_slide").maybeSingle(),
    supabase
      .from("activities")
      .select(MAP_LISTING_COLUMNS)
      .eq("status", "published")
      .eq("is_paused_by_host", false)
      .neq("category_type", "place")
      .neq("category_type", "event"),
    supabase
      .from("hotels")
      .select("id, title, slug, location, cover_image_url, latitude, longitude, hotel_room_types(nightly_rate_usd, is_active)")
      .eq("status", "published")
      .eq("is_paused", false),
    supabase
      .from("hotels")
      .select("id, title, slug, location, cover_image_url, latitude, longitude, is_featured, hotel_room_types(nightly_rate_usd, is_active)")
      .eq("status", "published")
      .eq("is_paused", false)
      .eq("is_featured", true),
  ])

  const activities = (activitiesRes.data || []).map(withActivityHref)
  const hotels = (hotelsRes.data || []).map(hotelListing)
  const featuredHotels = (featuredHotelsRes.data || []).map(hotelListing)
  const featuredActivities = (featuredRes.data || []).map(withActivityHref)

  return {
    featuredSpotlight: spotlightRes.data?.value ?? null,
    featuredTours: [...featuredActivities, ...featuredHotels],
    introSlide: introRes.data?.value ?? null,
    mapListings: [...activities, ...hotels],
  }
}

export const getHomepageHeroData = unstable_cache(fetchHomepageHeroData, ["homepage-hero-vertical"], {
  revalidate: 60,
  tags: ["hero-carousel"],
})

async function fetchHomepageCategoryMap(): Promise<HomepageCategoryMap> {
  const map = emptyHomepageCategoryMap()
  const withIcons = await supabase
    .from("categories")
    .select("name, slug, icon_url, category_type")
    .in("category_type", [...PUBLIC_VERTICALS])
    .order("sort_order", { ascending: true })
    .order("name")

  const rows = withIcons.error
    ? (
        await supabase
          .from("categories")
          .select("name, slug, category_type")
          .in("category_type", [...PUBLIC_VERTICALS])
          .order("sort_order", { ascending: true })
          .order("name")
      ).data
    : withIcons.data

  for (const row of rows ?? []) {
    const type = row.category_type as PublicVertical
    if (type === "tour" || type === "transport" || type === "hotel") {
      map[type].push(row)
    }
  }

  return map
}

export const getHomepageCategoryMap = unstable_cache(fetchHomepageCategoryMap, ["homepage-category-map"], {
  revalidate: 60,
  tags: ["homepage-categories"],
})

export async function getHomepageCategories(vertical: string) {
  const map = await getHomepageCategoryMap()
  return map[publicVertical(vertical)]
}
