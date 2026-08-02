"use client"

import { ActivityCard } from "@/components/activity/ActivityCard"
import { useFavorites } from "@/hooks/useFavorites"

interface ActivityGridProps {
  activities: any[]
  currentCategory: string
}

export function ActivityGrid({ activities, currentCategory }: ActivityGridProps) {
  const { favorites, isHydrated } = useFavorites()

  let displayActivities = activities

  if (currentCategory === 'saved') {
    if (!isHydrated) {
      return <div className="h-40"></div>
    }
    displayActivities = activities.filter(act => favorites.includes(act.id))
  }

  if (displayActivities.length === 0) {
    if (currentCategory === 'saved') {
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

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {displayActivities.map((act) => (
        <ActivityCard
          key={act.id}
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
          pricingModel={act.pricingModel}
          maxGuests={act.maxGuests}
          priceSuffix={act.price_suffix}
        />
      ))}
    </div>
  )
}
