import { unstable_cache } from "next/cache"
import { supabase } from "@/lib/supabase"

const HERO_TOUR_COLUMNS =
  "id, title, slug, location, cover_image_url, card_image_url, use_dark_text_desktop, use_dark_text_mobile"

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

export const getHomepageCategories = unstable_cache(
  async (vertical: string) => {
    const { data } = await supabase
      .from("categories")
      .select("name, slug")
      .eq("category_type", vertical)
      .order("sort_order", { ascending: true })
      .order("name")

    return data ?? []
  },
  ["homepage-categories"],
  { revalidate: 60, tags: ["homepage-categories"] }
)
