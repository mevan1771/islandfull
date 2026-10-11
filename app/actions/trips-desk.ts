"use server"

import { currentUser } from "@clerk/nextjs/server"
import { getMyBookings } from "@/app/actions/bookings"
import { fetchMyOffersFor } from "@/app/actions/offers"
import { fetchActivitiesByIds, fetchRecommendedTours } from "@/app/actions/wishlist"
import type { HomepageActivity } from "@/lib/homepage-feed"

function favoriteIdsFromUser(user: { unsafeMetadata?: Record<string, unknown> } | null) {
  const raw = user?.unsafeMetadata?.favoriteIds
  return Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : []
}

export async function getTripsDesk() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress?.toLowerCase() || null
  const favoriteIds = favoriteIdsFromUser(user)
  const [recommended, offers, bookings, saved] = await Promise.all([
    fetchRecommendedTours(favoriteIds),
    user ? fetchMyOffersFor(user.id, email) : Promise.resolve([]),
    user ? getMyBookings() : Promise.resolve([]),
    favoriteIds.length ? fetchActivitiesByIds(favoriteIds) : Promise.resolve([] as HomepageActivity[]),
  ])
  return {
    recommended,
    offers,
    bookings,
    saved,
    favoriteIds,
    firstName: user?.firstName || user?.fullName?.split(" ")[0] || null,
  }
}

export type TripsDesk = Awaited<ReturnType<typeof getTripsDesk>>
