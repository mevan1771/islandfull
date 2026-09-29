import { Suspense } from "react"
import { fetchRecommendedTours } from "@/app/actions/wishlist"
import { TripsPageClient } from "@/components/trips/TripsPageClient"

export const metadata = {
  title: "Trips & Wishlist | Islandfull",
  description: "Saved tours and upcoming trips in one place.",
}

export default async function TripsPage() {
  const recommended = await fetchRecommendedTours()

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50">
          <div className="h-64 bg-zinc-900" />
          <div className="max-w-7xl mx-auto px-4 py-10 text-sm text-zinc-500">Loading your trips…</div>
        </div>
      }
    >
      <TripsPageClient recommended={recommended} />
    </Suspense>
  )
}
