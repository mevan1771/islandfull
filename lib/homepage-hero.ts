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
  "id, title, slug, location, cover_image_url, card_image_url, use_dark_text_desktop, use_dark_text_mobile, price_usd, price_suffix, discount_price, deal_end_date, pricing_model, pricing_tiers"

export type HomepageHeroPayload = {
  featuredTours: any[]
  introSlide: any
  featuredSpotlight: any
}

async function fetchHomepageHeroData(): Promise<HomepageHeroPayload> {
  const [spotlightRes, featuredRes, introRes] = await Promise.all([
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
      .limit(5),
    supabase.from("global_settings").select("value").eq("key", "hero_intro_slide").maybeSingle(),
  ])

  return {
    featuredSpotlight: spotlightRes.data?.value ?? null,
    featuredTours: featuredRes.data ?? [],
    introSlide: introRes.data?.value ?? null,
  }
}

export const getHomepageHeroData = unstable_cache(fetchHomepageHeroData, ["homepage-hero"], {
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
