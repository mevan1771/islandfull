import { HomeFilters } from "@/components/home/HomeFilters"
import { MobileSearch } from "@/components/home/MobileSearch"
import { HomeVerticalBar } from "@/components/home/HomeVerticalBar"
import { ActivityGrid } from "@/components/home/ActivityGrid"
import { Suspense } from "react"
import { preload } from "react-dom"
import { HeroCarousel } from "@/components/home/HeroCarousel"
import { HomeScrollRestore } from "@/components/home/HomeScrollRestore"
import { getHomepageCategoryMap, getHomepageHeroData } from "@/lib/homepage-hero"
import { heroDefaultSrc, heroSrcSet, HERO_SIZES } from "@/lib/hero-media"
import { fetchHomepageActivities, fetchMustSeePlaces } from "@/app/actions/homepage-activities"
import { HOMEPAGE_PAGE_SIZE, publicVertical } from "@/lib/homepage-feed"
import type { SpotlightConfig } from "@/components/admin/SpotlightClient"
import type { Metadata } from "next"
import { pageMeta } from "@/lib/seo"

export const revalidate = 60

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}): Promise<Metadata> {
  const params = await searchParams
  const vertical = publicVertical(params.vertical)
  if (vertical === "transport") {
    return pageMeta({
      title: "Sri Lanka transport — tours stay here, drivers start on the map",
      description:
        "Find local transport hosts in Sri Lanka or open the route planner to send your price for a private car, van, or airport pickup.",
      path: "/transport",
    })
  }
  if (vertical === "hotel") {
    return pageMeta({
      title: "Sri Lanka hotels and stays with local hosts",
      description: "Browse stays across Sri Lanka — from city nights to beach and hill country. Book with IslandFull.",
      path: "/?vertical=hotel",
    })
  }
  return pageMeta({
    title: "Sri Lanka tours, activities, hotels & transport",
    description:
      "Inspiration, planning, and booking in one place. Local tours, private drivers, airport transfers, and stays across Sri Lanka.",
    path: "/",
  })
}

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const currentVertical = publicVertical(params.vertical);
  const currentCategory = params.category || 'all';

  const [{ featuredTours, introSlide, featuredSpotlight }, categoryMap] = await Promise.all([
    getHomepageHeroData(),
    getHomepageCategoryMap(),
  ]);
  const dynamicCategories = categoryMap[currentVertical];

  const carouselSlides = [
    {
      id: 'static-intro',
      title: introSlide?.title ?? 'Your Journey in Sri Lanka Begins Here',
      subtitle: introSlide?.subtitle ?? 'Inspiration, planning, and booking—all in one place.',
      slug: '',
      cover_image_url: introSlide?.cover_image_url || 'https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      isStatic: true,
      use_dark_text_desktop: introSlide?.use_dark_text_desktop || introSlide?.useDarkText || false,
      use_dark_text_mobile: introSlide?.use_dark_text_mobile || introSlide?.useDarkText || false
    },
    ...featuredTours
  ];

  const lcpUrl = carouselSlides[0]?.cover_image_url;
  if (lcpUrl) {
    preload(heroDefaultSrc(lcpUrl), {
      as: "image",
      fetchPriority: "high",
      imageSrcSet: heroSrcSet(lcpUrl),
      imageSizes: HERO_SIZES,
    });
  }

  return (
    <div className="pb-28 sm:pb-24 [overflow-anchor:none]" data-home-page>
      <HomeScrollRestore listingKey={`${currentVertical}:${currentCategory}:${params.location || ""}:${params.sort || ""}`} />
      {/* Hero Section */}
      <HeroCarousel carouselSlides={carouselSlides} />

      {/* Mobile Search Inline Card */}
      <Suspense fallback={null}>
        <MobileSearch dynamicCategories={dynamicCategories} categoryMap={categoryMap} />
        <HomeVerticalBar />
      </Suspense>

      {/* Dynamic Filters UI */}
        <Suspense fallback={null}>
        <HomeFilters dynamicCategories={dynamicCategories} categoryMap={categoryMap} />
      </Suspense>

      {/* Activity Grid */}
      <section id="activity-grid-container" className="max-w-7xl mx-auto px-4 py-4 md:py-8 max-md:scroll-mt-[7.5rem]">
        <Suspense fallback={<ActivitySkeleton />}>
          <ActivityGridServer
            searchParams={params}
            currentCategory={currentCategory}
            spotlightSlides={Array.isArray(featuredSpotlight) ? featuredSpotlight : featuredSpotlight ? [featuredSpotlight] : null}
          />
        </Suspense>
      </section>

    </div>
  )
}

const ActivitySkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {[...Array(12)].map((_, i) => (
      <div key={i} className="flex flex-col gap-3">
        <div className="w-full aspect-[4/3] bg-zinc-100 rounded-2xl animate-pulse"></div>
        <div className="w-3/4 h-4 bg-zinc-100 rounded animate-pulse"></div>
        <div className="w-1/2 h-4 bg-zinc-100 rounded animate-pulse"></div>
      </div>
    ))}
  </div>
);

async function ActivityGridServer({
  searchParams,
  currentCategory,
  spotlightSlides,
}: {
  searchParams: any
  currentCategory: string
  spotlightSlides: SpotlightConfig[] | null
}) {
  const filters = {
    vertical: publicVertical(searchParams.vertical),
    category: searchParams.category || "all",
    location: searchParams.location || "",
    sort: searchParams.sort || "",
  }

  const limit = filters.category === "saved" ? 100 : HOMEPAGE_PAGE_SIZE
  const [{ activities, total }, mustSeePlaces] = await Promise.all([
    fetchHomepageActivities(filters, 0, limit),
    filters.vertical === "tour" ? fetchMustSeePlaces() : Promise.resolve([]),
  ])

  return (
    <ActivityGrid
      activities={activities}
      total={total}
      currentCategory={currentCategory}
      filters={filters}
      spotlightSlides={spotlightSlides}
      mustSeePlaces={mustSeePlaces}
    />
  )
}
