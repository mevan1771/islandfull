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

interface ActivityGridProps {
  activities: HomepageActivity[]
  total: number
  currentCategory: string
  filters: HomepageActivityFilters
  spotlightSlides?: SpotlightConfig[] | null
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

export function ActivityGrid({
  activities,
  total,
  currentCategory,
  filters,
  spotlightSlides,
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

  const leading = displayActivities.slice(0, 6)
  const desktopOnlyBeforeSpotlight = displayActivities.slice(6, 8)
  const trailing = displayActivities.slice(8)

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {leading.map((act) => (
          <ActivityCardFromItem key={act.id} act={act} />
        ))}
        {showSpotlight ? (
          <div className="hidden md:contents">
            {desktopOnlyBeforeSpotlight.map((act) => (
              <ActivityCardFromItem key={act.id} act={act} />
            ))}
          </div>
        ) : (
          desktopOnlyBeforeSpotlight.map((act) => (
            <ActivityCardFromItem key={act.id} act={act} />
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
              {desktopOnlyBeforeSpotlight.map((act) => (
                <ActivityCardFromItem key={`${act.id}-m`} act={act} />
              ))}
            </div>
          )}
          {trailing.map((act) => (
            <ActivityCardFromItem key={act.id} act={act} />
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
