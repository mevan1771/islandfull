import { Suspense } from "react"
import Link from "next/link"
import { HomeFilters } from "@/components/home/HomeFilters"
import { MobileSearch } from "@/components/home/MobileSearch"
import { HomeVerticalBar } from "@/components/home/HomeVerticalBar"
import { ActivityGrid } from "@/components/home/ActivityGrid"
import { HomeScrollRestore } from "@/components/home/HomeScrollRestore"
import { HeaderThemeSetter } from "@/components/layout/HeaderThemeSetter"
import { JsonLd } from "@/components/seo/JsonLd"
import { HomeExploreShell } from "@/components/home/HomeExploreShell"
import { getFeaturedSpotlight, getHomepageCategoryMap, getHomepageMapListings } from "@/lib/homepage-hero"
import { toMapTours } from "@/lib/map-listings"
import { fetchHomepageActivities } from "@/app/actions/homepage-activities"
import { HOMEPAGE_PAGE_SIZE } from "@/lib/homepage-feed"
import { pageMeta, breadcrumbJsonLd, faqJsonLd, serviceJsonLd } from "@/lib/seo"
import { TRANSPORT_FAQS } from "@/lib/transport-seo"
import type { SpotlightConfig } from "@/components/admin/SpotlightClient"

export const revalidate = 60

export const metadata = pageMeta({
  title: "Sri Lanka transport — private drivers, cars, vans & airport pickup",
  description:
    "Book local transport hosts in Sri Lanka: private cars, vans, tuk-tuks, and airport transfers. Plan a custom route or pick a host card and send your price.",
  path: "/transport",
  keywords: [
    "Sri Lanka transport",
    "private driver Sri Lanka",
    "Colombo airport transfer",
    "car with driver Sri Lanka",
    "van hire Sri Lanka",
  ],
})

export default async function TransportMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const currentCategory = params.category || "all"

  const [featuredSpotlight, categoryMap, mapRows] = await Promise.all([
    getFeaturedSpotlight(),
    getHomepageCategoryMap(),
    getHomepageMapListings(),
  ])
  const dynamicCategories = categoryMap.transport
  const mapTours = toMapTours(mapRows)

  return (
    <HomeExploreShell mapTours={mapTours} categories={dynamicCategories} vertical="transport">
    <div className="min-w-0 max-w-full pb-28 sm:pb-24 [overflow-anchor:none]" data-home-page>
      <HeaderThemeSetter useDarkTextDesktop useDarkTextMobile />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Transport", path: "/transport" },
          ]),
          serviceJsonLd({
            name: "Sri Lanka private transport with local hosts",
            description:
              "Book cars, vans, tuk-tuks, and airport pickups from local hosts, or plan a custom route and send your price.",
            path: "/transport",
            serviceType: "Private driver and airport transfer",
          }),
          faqJsonLd(TRANSPORT_FAQS),
        ]}
      />
      <HomeScrollRestore listingKey={`transport:${currentCategory}:${params.location || ""}:${params.sort || ""}`} />

      <Suspense fallback={null}>
        <MobileSearch dynamicCategories={dynamicCategories} categoryMap={categoryMap} />
        <HomeVerticalBar />
      </Suspense>

      <Suspense fallback={null}>
        <HomeFilters dynamicCategories={dynamicCategories} categoryMap={categoryMap} />
      </Suspense>

      <section id="activity-grid-container" className="max-w-7xl mx-auto px-4 pt-2 pb-4 md:pt-2 md:pb-8 max-md:scroll-mt-[4.75rem]">
        <Suspense fallback={<TransportGridSkeleton />}>
          <TransportGrid
            searchParams={params}
            currentCategory={currentCategory}
            spotlightSlides={
              Array.isArray(featuredSpotlight) ? featuredSpotlight : featuredSpotlight ? [featuredSpotlight] : null
            }
          />
        </Suspense>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 md:px-5">
          <p className="text-sm font-semibold text-zinc-900">Need a custom route?</p>
          <p className="mt-1 text-sm text-zinc-600">
            Airport pickup, multi-stop trips, and how to get around — then send your price to hosts.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href="/transport/plan" className="rounded-full bg-[#FFC72C] px-3 py-1.5 text-xs font-bold text-zinc-900">
              Plan a route
            </Link>
            <Link href="/transport/getting-around-sri-lanka" className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-800">
              How to get around
            </Link>
            <Link href="/transport/airport-transfers" className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-800">
              Airport transfers
            </Link>
            <Link href="/transport/private-driver" className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-800">
              Private driver
            </Link>
          </div>
        </div>
      </section>
    </div>
    </HomeExploreShell>
  )
}

function TransportGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="w-full aspect-[4/3] bg-zinc-100 rounded-2xl animate-pulse" />
          <div className="w-3/4 h-4 bg-zinc-100 rounded animate-pulse" />
          <div className="w-1/2 h-4 bg-zinc-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

async function TransportGrid({
  searchParams,
  currentCategory,
  spotlightSlides,
}: {
  searchParams: { [key: string]: string | undefined }
  currentCategory: string
  spotlightSlides: SpotlightConfig[] | null
}) {
  const filters = {
    vertical: "transport" as const,
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
    />
  )
}
