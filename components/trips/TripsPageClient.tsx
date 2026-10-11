"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { CalendarDays, Compass, Heart, MapPinned, Sparkles, Users } from "lucide-react"
import { format, parseISO } from "date-fns"
import toast from "react-hot-toast"
import { dayCountLabel, inclusiveDays } from "@/lib/date-range-label"
import { ActivityCard } from "@/components/activity/ActivityCard"
import { useFavorites } from "@/hooks/useFavorites"
import { fetchActivitiesByIds, fetchRecommendedTours } from "@/app/actions/wishlist"
import { cancelMyBooking, cancelMyUnpaidBookings } from "@/app/actions/bookings"
import { markPageReturn } from "@/lib/home-scroll"
import type { HomepageActivity } from "@/lib/homepage-feed"
import type { TripsDesk } from "@/app/actions/trips-desk"

function isUnpaidBooking(status: string) {
  return status === "pending" || status === "pending_payment"
}

function offerListing(offer: any) {
  const listing = offer?.activities
  return Array.isArray(listing) ? listing[0] : listing
}

function OfferStatus({ status }: { status: string }) {
  if (status === "accepted") {
    return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Accepted</span>
  }
  if (status === "declined") {
    return <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">Declined</span>
  }
  if (status === "countered") {
    return <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sky-700">Host replied</span>
  }
  return <span className="inline-flex items-center rounded-full bg-[#FFC72C] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-900">Pending</span>
}

function offerStatusCopy(offer: any) {
  if (offer.status === "accepted") return "Accepted · make payment to confirm"
  if (offer.status === "countered") {
    return offer.admin_counter_amount != null
      ? `Host suggested $${Number(offer.admin_counter_amount)}`
      : "Host sent another price"
  }
  if (offer.status === "declined") return "Host couldn’t take this price"
  return "Waiting on host"
}

function offerTravelLabel(offer: any) {
  const match = String(offer.special_notes || "").match(/Dates:\s*(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
  const start = parseISO(offer.travel_date)
  if (Number.isNaN(start.getTime())) return String(offer.travel_date || "")
  const end = match?.[2] ? parseISO(match[2]) : start
  if (Number.isNaN(end.getTime()) || format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
    return format(start, "d MMM")
  }
  const days = dayCountLabel(inclusiveDays(start, end))
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d")}–${format(end, "d MMM")} · ${days}`
  }
  return `${format(start, "d MMM")} – ${format(end, "d MMM")} · ${days}`
}

function bookingListing(booking: any) {
  const listing = booking?.activities
  return Array.isArray(listing) ? listing[0] : listing
}

function BookingCard({
  booking,
  onCancelled,
}: {
  booking: any
  onCancelled: (id: string) => void
}) {
  const listing = bookingListing(booking)
  const image = listing?.card_image_url || listing?.cover_image_url || "/placeholder.jpg"
  const slug = listing?.slug as string | undefined
  const status = String(booking.status || "")
  const unpaid = isUnpaidBooking(status)
  const [pending, startTransition] = useTransition()

  function cancelThis() {
    if (!window.confirm("Cancel this unpaid booking? You can reserve again later.")) return
    startTransition(async () => {
      const result = await cancelMyBooking(booking.id)
      if (!result.success) {
        toast.error(result.error || "Could not cancel.")
        return
      }
      onCancelled(booking.id)
      toast.success("Booking cancelled")
    })
  }

  const body = (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
        <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        <div className="absolute top-2.5 left-2.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              status === "confirmed" || status === "completed"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-800"
            }`}
          >
            {status.replace("_", " ") || "Booking"}
          </span>
        </div>
      </div>
      <div className="p-3.5 md:p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-[15px] md:text-base text-zinc-900 leading-snug line-clamp-2">
          {listing?.title || "Booking"}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
            {booking.end_date && booking.end_date !== booking.travel_date
              ? `${booking.travel_date} → ${booking.end_date}`
              : booking.travel_date}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            {booking.pax_count} {booking.pax_count === 1 ? "guest" : "guests"}
          </span>
        </div>
        <p className="mt-3 text-lg font-bold tracking-tight text-zinc-900">${Number(booking.total_usd || 0)}</p>
        {unpaid ? (
          <div className="mt-auto pt-3 flex items-center gap-2">
            {slug ? (
              <Link
                href={`/activity/${slug}`}
                onClick={() => markPageReturn("/trips")}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-full bg-zinc-900 px-3 text-xs font-semibold text-white"
              >
                View listing
              </Link>
            ) : null}
            <button
              type="button"
              onClick={cancelThis}
              disabled={pending}
              className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-zinc-200 px-3 text-xs font-semibold text-zinc-700 hover:border-zinc-400 disabled:opacity-60"
            >
              {pending ? "Cancelling…" : "Cancel"}
            </button>
          </div>
        ) : null}
      </div>
    </>
  )
  const className = "flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white h-full"
  if (unpaid || !slug) return <div className={className}>{body}</div>
  return (
    <Link href={`/activity/${slug}`} onClick={() => markPageReturn("/trips")} className={`${className} hover:border-zinc-300 hover:shadow-md transition-all`}>
      {body}
    </Link>
  )
}

function OfferCard({ offer }: { offer: any }) {
  const listing = offerListing(offer)
  const image = listing?.card_image_url || listing?.cover_image_url || "/placeholder.jpg"
  const slug = listing?.slug as string | undefined
  const cta = offer.status === "accepted" ? "Make payment" : "View listing"
  const location = listing?.location ? String(listing.location).replace(", Sri Lanka", "") : ""
  const body = (
    <>
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100">
        <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
        <div className="absolute top-2.5 left-2.5">
          <OfferStatus status={offer.status} />
        </div>
      </div>
      <div className="p-3.5 md:p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-[15px] md:text-base text-zinc-900 leading-snug line-clamp-2">
          {listing?.title || "Listing"}
        </h3>
        {location ? <p className="text-xs text-zinc-500 mt-0.5 truncate">{location}</p> : null}
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
            {offerTravelLabel(offer)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            {offer.guest_count} {offer.guest_count === 1 ? "guest" : "guests"}
          </span>
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">{offerStatusCopy(offer)}</p>
        <div className="mt-auto pt-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold tracking-tight text-zinc-900">${Number(offer.offer_amount)}</p>
            <p className="text-[11px] text-zinc-400 -mt-0.5">your offer</p>
          </div>
          <span
            className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-semibold ${
              offer.status === "accepted" ? "bg-[#22c55e] hover:bg-[#16a34a] text-white" : "bg-zinc-900 text-white"
            }`}
          >
            {cta}
          </span>
        </div>
      </div>
    </>
  )

  const className =
    "flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white h-full hover:border-zinc-300 hover:shadow-md transition-all"

  if (!slug) return <div className={className}>{body}</div>

  return (
    <Link
      href={offer.status === "accepted" && offer.payPath ? offer.payPath : `/activity/${slug}`}
      onClick={() => markPageReturn("/trips")}
      className={className}
    >
      {body}
    </Link>
  )
}

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
      allowOffers={act.allowOffers}
    />
  )
}

export function TripsPageClient({
  desk,
}: {
  desk: TripsDesk
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get("tab") === "wishlist" ? "wishlist" : "trips"
  const { user, isSignedIn } = useUser()
  const { favorites, isHydrated } = useFavorites()
  const [saved, setSaved] = useState<HomepageActivity[]>(desk.saved)
  const [ideas, setIdeas] = useState(desk.recommended)
  const [loadingSaved, setLoadingSaved] = useState(desk.saved.length === 0)
  const [offers] = useState<any[]>(desk.offers)
  const [bookings, setBookings] = useState<any[]>(desk.bookings)
  const [clearingUnpaid, startClearUnpaid] = useTransition()

  const newestFirst = useMemo(() => [...favorites].reverse(), [favorites])

  useEffect(() => {
    if (!isHydrated) return
    let cancelled = false

    async function load() {
      const sameAsServer =
        newestFirst.length === desk.favoriteIds.length &&
        newestFirst.every((id) => desk.favoriteIds.includes(id))
      if (sameAsServer) {
        setSaved(desk.saved)
        setIdeas(desk.recommended)
        setLoadingSaved(false)
        return
      }
      if (newestFirst.length === 0) {
        setSaved([])
        setIdeas(desk.recommended)
        setLoadingSaved(false)
        return
      }
      const [hearted, extra] = await Promise.all([
        fetchActivitiesByIds(newestFirst),
        fetchRecommendedTours(newestFirst),
      ])
      if (cancelled) return
      setSaved(hearted)
      setIdeas(extra.length ? extra : desk.recommended)
      setLoadingSaved(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isHydrated, favorites, desk])

  const locations = [...new Set(saved.map((a) => a.location.replace(", Sri Lanka", "")))]
  const firstName = user?.firstName || desk.firstName || "there"
  const upcomingCount =
    offers.filter((o) => o.status === "pending" || o.status === "accepted" || o.status === "countered").length +
    bookings.length

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
            {isSignedIn || desk.firstName ? `Hello, ${firstName}` : "Your trips"}
          </h1>
          <p className="mt-2 max-w-xl text-sm md:text-base text-white/75">
            Heart tours you love, then come back here to plan the days and book.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-semibold">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              {isHydrated || desk.saved.length ? saved.length : "—"} saved
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-semibold">
              <Compass className="w-3.5 h-3.5" />
              {locations.length || 0} destinations
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-semibold">
              <CalendarDays className="w-3.5 h-3.5" />
              {upcomingCount} upcoming
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
            {offers.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-zinc-900 mb-2">Your offers</h2>
                <p className="text-sm text-zinc-500 mb-5">Bids you sent. We’ll update this when the host replies.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
                  {offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                  ))}
                </div>
              </div>
            )}
            <div className="flex items-end justify-between gap-4 mb-2">
              <h2 className="text-xl font-bold text-zinc-900">Upcoming bookings</h2>
              {bookings.some((b) => isUnpaidBooking(String(b.status || ""))) ? (
                <button
                  type="button"
                  disabled={clearingUnpaid}
                  onClick={() => {
                    if (!window.confirm("Remove every unpaid booking from your trips? Confirmed paid trips stay.")) return
                    startClearUnpaid(async () => {
                      const result = await cancelMyUnpaidBookings()
                      if (!result.success) {
                        toast.error(result.error || "Could not clear unpaid bookings.")
                        return
                      }
                      setBookings((prev) => prev.filter((b) => !isUnpaidBooking(String(b.status || ""))))
                      toast.success(result.cancelled ? `Cleared ${result.cancelled} unpaid booking${result.cancelled === 1 ? "" : "s"}` : "Nothing unpaid to clear")
                    })
                  }}
                  className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 disabled:opacity-60"
                >
                  {clearingUnpaid ? "Clearing…" : "Clear unpaid"}
                </button>
              ) : null}
            </div>
            <p className="text-sm text-zinc-500 mb-5">Unpaid holds stay until you pay or cancel. Confirmed trips appear after checkout.</p>
            {bookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
                {bookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancelled={(id) => setBookings((prev) => prev.filter((b) => b.id !== id))}
                  />
                ))}
              </div>
            ) : (
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
            )}
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
