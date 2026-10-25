import { Suspense } from "react"
import { getTripsDesk } from "@/app/actions/trips-desk"
import { TripsPageClient } from "@/components/trips/TripsPageClient"

export const dynamic = "force-dynamic"

export const metadata = {
  title: { absolute: "Trips & Wishlist | IslandFull" },
  description: "Saved tours and upcoming trips in one place.",
  robots: { index: false, follow: false },
}

export default async function TripsPage() {
  const desk = await getTripsDesk()

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50">
          <div className="h-64 bg-zinc-900" />
          <div className="max-w-7xl mx-auto px-4 py-10 text-sm text-zinc-500">Loading your trips…</div>
        </div>
      }
    >
      <TripsPageClient desk={desk} />
    </Suspense>
  )
}
