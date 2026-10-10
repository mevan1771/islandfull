import { HomeFilters } from "@/components/home/HomeFilters"
import { MobileSearch } from "@/components/home/MobileSearch"
import { ActivityGrid } from "@/components/home/ActivityGrid"
import { Suspense } from "react"
import { preload } from "react-dom"
import { HeroCarousel } from "@/components/home/HeroCarousel"
import { HomeScrollRestore } from "@/components/home/HomeScrollRestore"
import { getHomepageCategories, getHomepageHeroData } from "@/lib/homepage-hero"
import { heroDefaultSrc, heroSrcSet, HERO_SIZES } from "@/lib/hero-media"
import { fetchHomepageActivities, fetchMustSeePlaces } from "@/app/actions/homepage-activities"
import { HOMEPAGE_PAGE_SIZE } from "@/lib/homepage-feed"
import type { SpotlightConfig } from "@/components/admin/SpotlightClient"

export const revalidate = 60

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const currentVertical = params.vertical || 'tour';
  const currentCategory = params.category || 'all';

  const [{ featuredTours, introSlide, featuredSpotlight }, dynamicCategories, mustSeePlaces] = await Promise.all([
    getHomepageHeroData(),
    getHomepageCategories(currentVertical),
    currentVertical === "tour" ? fetchMustSeePlaces() : Promise.resolve([]),
  ]);

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
    <div className="pb-24" data-home-page>
      <HomeScrollRestore />
      {/* Hero Section */}
      <HeroCarousel carouselSlides={carouselSlides} />

      {/* Mobile Search Inline Card */}
      <Suspense fallback={null}>
        <MobileSearch />
      </Suspense>

      {/* Dynamic Filters UI */}
      <Suspense fallback={<div className="h-40"></div>}>
        <HomeFilters dynamicCategories={dynamicCategories} />
      </Suspense>

      {/* Activity Grid */}
      <section id="activity-grid-container" className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <Suspense fallback={<ActivitySkeleton />}>
          <ActivityGridServer
            searchParams={params}
            currentCategory={currentCategory}
            spotlightSlides={Array.isArray(featuredSpotlight) ? featuredSpotlight : featuredSpotlight ? [featuredSpotlight] : null}
            mustSeePlaces={currentVertical === "tour" ? mustSeePlaces : []}
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
  mustSeePlaces,
}: {
  searchParams: any
  currentCategory: string
  spotlightSlides: SpotlightConfig[] | null
  mustSeePlaces: Awaited<ReturnType<typeof fetchMustSeePlaces>>
}) {
  const filters = {
    vertical: searchParams.vertical || "tour",
    category: searchParams.category || "all",
    location: searchParams.location || "",
    sort: searchParams.sort || "",
  }

  const limit = filters.category === "saved" ? 100 : HOMEPAGE_PAGE_SIZE
  const { activities, total } = await fetchHomepageActivities(filters, 0, limit)

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
