"use client"

import { useEffect, useState, useTransition } from "react"
import { ActivityCard } from "@/components/activity/ActivityCard"
import { useFavorites } from "@/hooks/useFavorites"
import { SpotlightCarousel } from "@/components/home/SpotlightCarousel"
import { fetchHomepageActivities } from "@/app/actions/homepage-activities"
import {
  HOMEPAGE_PAGE_SIZE,
  type HomepageActivity,
  type HomepageActivityFilters,
} from "@/lib/homepage-feed"
import type { SpotlightConfig } from "@/components/admin/SpotlightClient"

type MustSeePlace = {
  id: string
  title: string
  slug: string
  location: string
  duration?: string | null
  coverImage: string
}

type GridCell =
  | { type: "tour"; act: HomepageActivity }
  | { type: "place"; place: MustSeePlace }

interface ActivityGridProps {
  activities: HomepageActivity[]
  total: number
  currentCategory: string
  filters: HomepageActivityFilters
  spotlightSlides?: SpotlightConfig[] | null
  mustSeePlaces?: MustSeePlace[]
}

function ActivityCardFromItem({ act }: { act: HomepageActivity }) {
  return (
    <ActivityCard
      id={act.id}
      title={act.title}
      slug={act.slug}
      location={act.location}
      duration={act.duration}
      priceUsd={act.priceUsd}
      coverImage={act.coverImage}
      isHiddenGem={act.isHiddenGem}
      rating={act.rating}
      reviewCount={act.reviewCount}
      pricingModel={act.pricingModel as any}
      maxGuests={act.maxGuests}
      priceSuffix={act.price_suffix || undefined}
      discountPrice={act.discount_price || undefined}
      dealEndDate={act.deal_end_date || undefined}
      pricingTiers={act.pricingTiers}
    />
  )
}

function PlaceCard({ place }: { place: MustSeePlace }) {
  return (
    <ActivityCard
      id={place.id}
      title={place.title}
      slug={place.slug}
      location={place.location}
      duration={place.duration || ""}
      priceUsd={0}
      coverImage={place.coverImage || "/placeholder.jpg"}
      variant="place"
    />
  )
}

function withMustSeeSlots(tours: HomepageActivity[], places: MustSeePlace[]): GridCell[] {
  const cells: GridCell[] = []
  let pi = 0
  for (let i = 0; i < tours.length; i++) {
    cells.push({ type: "tour", act: tours[i] })
    if ((i + 1) % 4 === 0 && pi < places.length) {
      cells.push({ type: "place", place: places[pi++] })
    }
  }
  if (pi === 0 && places[0] && tours.length > 0) {
    cells.push({ type: "place", place: places[0] })
  }
  return cells
}

function Cell({ cell }: { cell: GridCell }) {
  if (cell.type === "place") {
    return <PlaceCard place={cell.place} />
  }
  return <ActivityCardFromItem act={cell.act} />
}

export function ActivityGrid({
  activities,
  total,
  currentCategory,
  filters,
  spotlightSlides,
  mustSeePlaces = [],
}: ActivityGridProps) {
  const { favorites, isHydrated } = useFavorites()
  const [items, setItems] = useState(activities)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setItems(activities)
  }, [activities])

  let displayActivities = items
  if (currentCategory === "saved") {
    if (!isHydrated) {
      return <div className="h-40"></div>
    }
    displayActivities = items.filter((act) => favorites.includes(act.id))
  }

  const injectPlaces =
    filters.vertical !== "event" &&
    filters.vertical !== "transport" &&
    currentCategory !== "saved" &&
    (!filters.category || filters.category === "all")

  const locationQ = (filters.location || "").trim().toLowerCase()
  const placesForGrid = injectPlaces
    ? mustSeePlaces.filter((place) => {
        if (!locationQ) return true
        return (
          place.location.toLowerCase().includes(locationQ) ||
          place.title.toLowerCase().includes(locationQ)
        )
      })
    : []

  const cells = withMustSeeSlots(displayActivities, placesForGrid)

  const showSpotlight =
    currentCategory !== "saved" &&
    Array.isArray(spotlightSlides) &&
    spotlightSlides.length > 0

  const canLoadMore = currentCategory !== "saved" && items.length < total

  const loadMore = () => {
    startTransition(async () => {
      const { activities: next } = await fetchHomepageActivities(filters, items.length, HOMEPAGE_PAGE_SIZE)
      setItems((prev) => {
        const seen = new Set(prev.map((a) => a.id))
        return [...prev, ...next.filter((a) => !seen.has(a.id))]
      })
    })
  }

  if (displayActivities.length === 0) {
    if (currentCategory === "saved") {
      return (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-100 max-w-2xl mx-auto">
          <h3 className="text-xl font-bold text-zinc-900 mb-2">You haven't saved any tours yet.</h3>
          <p className="text-zinc-500">Click the heart icon on a tour to save it here for later!</p>
        </div>
      )
    }

    return (
      <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-zinc-100">
        <h3 className="text-xl font-bold text-zinc-900 mb-2">No activities found</h3>
        <p className="text-zinc-500">Try adjusting your search filters to see more results.</p>
      </div>
    )
  }

  const leading = cells.slice(0, 8)
  const desktopOnlyBeforeSpotlight = cells.slice(8, 12)
  const trailing = cells.slice(12)

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {leading.map((cell) => (
          <Cell key={cell.type === "place" ? `p-${cell.place.id}` : cell.act.id} cell={cell} />
        ))}
        {showSpotlight ? (
          <div className="hidden md:contents">
            {desktopOnlyBeforeSpotlight.map((cell) => (
              <Cell key={cell.type === "place" ? `p-${cell.place.id}` : cell.act.id} cell={cell} />
            ))}
          </div>
        ) : (
          desktopOnlyBeforeSpotlight.map((cell) => (
            <Cell key={cell.type === "place" ? `p-${cell.place.id}` : cell.act.id} cell={cell} />
          ))
        )}
      </div>

      {showSpotlight && (
        <div className="mt-4 md:mt-8 -mx-4 md:mx-0">
          <SpotlightCarousel slides={spotlightSlides} embedded />
        </div>
      )}

      {(trailing.length > 0 || (showSpotlight && desktopOnlyBeforeSpotlight.length > 0)) && (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4 mt-4 md:mt-8">
          {showSpotlight && (
            <div className="contents md:hidden">
              {desktopOnlyBeforeSpotlight.map((cell) => (
                <Cell
                  key={cell.type === "place" ? `p-${cell.place.id}-m` : `${cell.act.id}-m`}
                  cell={cell}
                />
              ))}
            </div>
          )}
          {trailing.map((cell) => (
            <Cell key={cell.type === "place" ? `p-${cell.place.id}` : cell.act.id} cell={cell} />
          ))}
        </div>
      )}

      {currentCategory !== "saved" && total > 0 && (
        <div className="flex flex-col items-center gap-3 mt-8 mb-4">
          <p className="text-sm text-zinc-500">
            Showing {Math.min(displayActivities.length, total)} of {total}
          </p>
          {canLoadMore && (
            <button
              type="button"
              onClick={loadMore}
              disabled={isPending}
              className="bg-zinc-900 hover:bg-black disabled:opacity-60 text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors"
            >
              {isPending ? "Loading…" : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
