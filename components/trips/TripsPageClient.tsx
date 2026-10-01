"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { CalendarDays, Compass, Heart, MapPinned, Sparkles } from "lucide-react"
import { ActivityCard } from "@/components/activity/ActivityCard"
import { useFavorites } from "@/hooks/useFavorites"
import { fetchActivitiesByIds, fetchRecommendedTours } from "@/app/actions/wishlist"
import type { HomepageActivity } from "@/lib/homepage-feed"

function CardFromItem({ act }: { act: HomepageActivity }) {
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
      alwaysShowFavorite
    />
  )
}

export function TripsPageClient({ recommended }: { recommended: HomepageActivity[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get("tab") === "wishlist" ? "wishlist" : "trips"
  const { user, isSignedIn } = useUser()
  const { favorites, isHydrated } = useFavorites()
  const [saved, setSaved] = useState<HomepageActivity[]>([])
  const [ideas, setIdeas] = useState(recommended)
  const [loadingSaved, setLoadingSaved] = useState(true)

  const newestFirst = useMemo(() => [...favorites].reverse(), [favorites])

  useEffect(() => {
    if (!isHydrated) return
    let cancelled = false

    async function load() {
      if (newestFirst.length === 0) {
        setSaved([])
        setIdeas(recommended)
        setLoadingSaved(false)
        const extra = await fetchRecommendedTours([])
        if (!cancelled && extra.length) setIdeas(extra)
        return
      }
      const [hearted, extra] = await Promise.all([
        fetchActivitiesByIds(newestFirst),
        fetchRecommendedTours(newestFirst),
      ])
      if (cancelled) return
      setSaved(hearted)
      setIdeas(extra.length ? extra : recommended)
      setLoadingSaved(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isHydrated, favorites, recommended])

  const locations = [...new Set(saved.map((a) => a.location.replace(", Sri Lanka", "")))]
  const firstName = user?.firstName || "there"

  return (
    <div className="min-h-screen bg-zinc-50 pb-16">
      <div className="relative z-0 overflow-hidden bg-zinc-950 text-white min-h-[280px] md:min-h-[340px]">
        <Image
          src="/images/profile/profil-pic-1.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[center_35%] pointer-events-none"
          sizes="100vw"
        />
        <div className="absolute inset-0 md:hidden pointer-events-none bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-0 hidden md:block pointer-events-none bg-gradient-to-r from-black/80 via-black/45 to-transparent w-[min(42rem,70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 pt-28 pb-10 md:pt-32 md:pb-12">
          <p className="text-xs font-semibold tracking-widest uppercase text-white/70 mb-2">Your travel desk</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {isSignedIn ? `Hello, ${firstName}` : "Your trips"}
          </h1>
          <p className="mt-2 max-w-xl text-sm md:text-base text-white/75">
            Heart tours you love, then come back here to plan the days and book.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              {isHydrated ? saved.length : "—"} saved
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              {locations.length || 0} destinations
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-semibold">
              <CalendarDays className="w-3.5 h-3.5" />
              0 upcoming
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-5 relative z-20">
        <div className="inline-flex rounded-full bg-white p-1 shadow-md border border-zinc-100">
          <button
            type="button"
            onClick={() => router.replace("/trips?tab=trips", { scroll: false })}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === "trips" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            My Trips
          </button>
          <button
            type="button"
            onClick={() => router.replace("/trips?tab=wishlist", { scroll: false })}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === "wishlist" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Wishlist
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8">
        {tab === "wishlist" ? (
          <section>
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">Saved tours</h2>
                <p className="text-sm text-zinc-500 mt-1">Tap the heart on any card to remove it from this list.</p>
              </div>
              <Link href="/" className="text-sm font-semibold text-rose-500 shrink-0">
                Browse more
              </Link>
            </div>

            {!isHydrated || loadingSaved ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-zinc-200/70 animate-pulse" />
                ))}
              </div>
            ) : saved.length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 bg-white p-8 md:p-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50">
                  <Heart className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Nothing saved yet</h3>
                <p className="mt-2 text-sm text-zinc-500 max-w-md mx-auto">
                  {isSignedIn
                    ? "Heart tours from your phone or this computer — they stay on your account. If you already liked tours on another device, open the site there once while signed in so they can upload."
                    : "Heart tours from the homepage or a tour page. Sign in to keep them when you switch phones or computers."}
                </p>
                <Link
                  href="/"
                  className="inline-flex mt-6 min-h-11 items-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white"
                >
                  Find a tour
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {saved.map((act) => (
                  <CardFromItem key={act.id} act={act} />
                ))}
              </div>
            )}

            {locations.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {locations.map((place) => (
                  <Link
                    key={place}
                    href={`/?location=${encodeURIComponent(place)}`}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-zinc-900"
                  >
                    {place}
                  </Link>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Upcoming bookings</h2>
            <p className="text-sm text-zinc-500 mb-5">Confirmed reservations will appear here after checkout.</p>
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 shrink-0">
                  <MapPinned className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-zinc-900">No trips on the calendar yet</h3>
                  <p className="mt-2 text-sm text-zinc-500 max-w-lg">
                    Start from a saved tour, or open the map and pick a coast, a park, or a hill town. Once you reserve, this page becomes your itinerary.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Link href="/trips?tab=wishlist" className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white">
                    Open wishlist
                  </Link>
                  <Link href="/map" className="inline-flex min-h-11 items-center justify-center rounded-full border border-zinc-200 px-5 text-sm font-semibold text-zinc-800">
                    Explore map
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {ideas.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <h2 className="text-xl font-bold text-zinc-900">Worth a look</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {ideas.slice(0, 4).map((act) => (
                <CardFromItem key={act.id} act={act} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
