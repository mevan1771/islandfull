"use client"

import { useEffect, useMemo, useState, useTransition, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { CalendarDays, Compass, Heart, MapPin, MapPinned, Sparkles } from "lucide-react"
import { differenceInDays, format, parseISO } from "date-fns"
import toast from "react-hot-toast"
import { dayCountLabel, inclusiveDays, nightCountLabel } from "@/lib/date-range-label"
import { formatPayHms, formatPayRingHours, isAcceptedOfferLive, offerMsLeft, payUrgency, payWindowProgress } from "@/lib/offer-countdown"
import { ActivityCard } from "@/components/activity/ActivityCard"
import { useFavorites } from "@/hooks/useFavorites"
import { fetchActivitiesByIds, fetchRecommendedTours } from "@/app/actions/wishlist"
import { cancelMyBooking, cancelMyUnpaidBookings, startPaymentForMyBooking } from "@/app/actions/bookings"
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

function PhotoBadge({
  children,
  tone = "plain",
}: {
  children: ReactNode
  tone?: "deal" | "due" | "paid" | "plain" | "muted"
}) {
  const styles = {
    deal: "bg-[#22c55e] text-white shadow-md shadow-emerald-500/25",
    due: "bg-[#FFC72C] text-zinc-900 shadow-md",
    paid: "bg-white/95 text-emerald-700",
    plain: "bg-white/95 text-zinc-900 shadow-sm",
    muted: "bg-black/55 text-white",
  }[tone]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold backdrop-blur-sm ${styles}`}>
      {children}
    </span>
  )
}

function OfferStatus({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <PhotoBadge tone="deal">
        <Sparkles className="h-3 w-3" />
        Offer accepted
      </PhotoBadge>
    )
  }
  if (status === "paid") return <PhotoBadge tone="paid">Paid</PhotoBadge>
  if (status === "expired") return <PhotoBadge tone="muted">Expired</PhotoBadge>
  if (status === "declined") return <PhotoBadge tone="muted">Declined</PhotoBadge>
  if (status === "countered") return <PhotoBadge tone="due">Host replied</PhotoBadge>
  return <PhotoBadge tone="due">Waiting on host</PhotoBadge>
}

function listingPlace(listing: any) {
  if (!listing?.location) return ""
  return String(listing.location).replace(", Sri Lanka", "").trim()
}

function bookingBadge(status: string) {
  if (status === "confirmed" || status === "completed") return "Confirmed"
  if (status === "pending_payment") return "Payment due"
  if (status === "pending") return "Payment due"
  return status.replace("_", " ")
}

function offerStatusCopy(offer: any, msLeft?: number | null) {
  if (offer.status === "accepted") {
    if (msLeft != null && msLeft <= 0) return "Expired · send a new offer"
    if (msLeft != null) return "Pay to lock this price"
    return "Accepted · make payment to confirm"
  }
  if (offer.status === "paid") return "Paid · this stay is confirmed"
  if (offer.status === "expired") return "Expired · this price is no longer held"
  if (offer.status === "countered") {
    return offer.admin_counter_amount != null
      ? `Host suggested $${Number(offer.admin_counter_amount)}`
      : "Host sent another price"
  }
  if (offer.status === "declined") return "Host couldn’t take this price"
  return "Waiting on host"
}

function offerTravelLabel(offer: any) {
  const listing = offerListing(offer)
  const match = String(offer.special_notes || "").match(/Dates:\s*(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/)
  const start = parseISO(offer.travel_date)
  if (Number.isNaN(start.getTime())) return String(offer.travel_date || "")
  const end = match?.[2] ? parseISO(match[2]) : start
  if (Number.isNaN(end.getTime()) || format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
    return format(start, "d MMM")
  }
  const days =
    listing?.category_type === "hotel"
      ? nightCountLabel(Math.max(1, differenceInDays(end, start)))
      : dayCountLabel(inclusiveDays(start, end))
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d")}–${format(end, "d MMM")} · ${days}`
  }
  return `${format(start, "d MMM")} – ${format(end, "d MMM")} · ${days}`
}

function bookingListing(booking: any) {
  const listing = booking?.activities
  return Array.isArray(listing) ? listing[0] : listing
}

function bookingTravelLabel(booking: any) {
  const listing = bookingListing(booking)
  const start = parseISO(booking.travel_date)
  if (Number.isNaN(start.getTime())) return String(booking.travel_date || "")
  const end = booking.end_date && booking.end_date !== booking.travel_date ? parseISO(booking.end_date) : start
  if (Number.isNaN(end.getTime()) || format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")) {
    return format(start, "d MMM")
  }
  const days =
    listing?.category_type === "hotel"
      ? nightCountLabel(Math.max(1, differenceInDays(end, start)))
      : dayCountLabel(inclusiveDays(start, end))
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d")}–${format(end, "d MMM")} · ${days}`
  }
  return `${format(start, "d MMM")} – ${format(end, "d MMM")} · ${days}`
}

function StayCardShell({
  image,
  badge,
  overlay,
  title,
  location,
  meta,
  aside,
  price,
  priceHint,
  actions,
  footer,
}: {
  image: string
  badge?: ReactNode
  overlay?: ReactNode
  title: string
  location?: string
  meta: ReactNode
  aside?: ReactNode
  price: number
  priceHint: string
  actions: ReactNode
  footer?: ReactNode
}) {
  return (
    <>
      <div className="flex flex-1 gap-3 p-2.5 md:flex-col md:gap-0 md:p-0">
        <div className="relative h-[92px] w-[92px] shrink-0 overflow-hidden rounded-2xl bg-zinc-100 md:h-auto md:w-full md:aspect-[4/3] md:rounded-none">
          {image ? (
            <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 768px) 92px, 50vw" />
          ) : null}
          <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-20 bg-gradient-to-b from-black/35 to-transparent md:block" />
          {badge ? <div className="absolute top-1 left-1 z-10 origin-top-left scale-90 md:top-3 md:left-3 md:scale-100">{badge}</div> : null}
          {overlay ? <div className="absolute top-1 right-1 z-10 origin-top-right scale-[0.62] md:top-3 md:right-3 md:scale-100">{overlay}</div> : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col py-0.5 md:p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[14px] text-zinc-900 leading-snug line-clamp-1 md:text-[15px] md:line-clamp-2">{title}</h3>
              {location ? (
                <p className="mt-0.5 flex items-center gap-1 text-[12px] text-zinc-500 md:text-[13px]">
                  <MapPin className="h-3 w-3 shrink-0 text-rose-400 md:h-3.5 md:w-3.5" />
                  <span className="truncate">{location}</span>
                </p>
              ) : null}
              <p className="mt-1 text-[12px] text-zinc-500 md:mt-1.5 md:text-[13px]">{meta}</p>
            </div>
            {aside}
          </div>
          <div className="mt-auto pt-2 flex items-center justify-between gap-2 md:pt-3 md:gap-3">
            <div>
              <p className="text-[16px] font-semibold tracking-tight text-zinc-900 md:text-[17px]">${Number(price)}</p>
              <p className="text-[11px] text-zinc-400 -mt-0.5 md:text-[12px]">{priceHint}</p>
            </div>
            {actions}
          </div>
        </div>
      </div>
      {footer}
    </>
  )
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
  const listingHref =
    listing?.listingPath ||
    (listing?.category_type === "hotel" && slug ? `/hotel/${slug}` : slug ? `/activity/${slug}` : "")
  const location = listingPlace(listing)
  const status = String(booking.status || "")
  const unpaid = isUnpaidBooking(status)
  const [pending, startTransition] = useTransition()
  const [paying, startPay] = useTransition()
  const router = useRouter()

  function payThis() {
    startPay(async () => {
      const result = await startPaymentForMyBooking(booking.id)
      if (result.url) {
        window.location.href = result.url
        return
      }
      toast.error(result.error || "Could not start payment.")
    })
  }

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
      router.refresh()
    })
  }

  const guests = `${booking.pax_count} ${booking.pax_count === 1 ? "guest" : "guests"}`
  const body = (
    <StayCardShell
      image={image}
      badge={<PhotoBadge tone={unpaid ? "due" : "paid"}>{bookingBadge(status)}</PhotoBadge>}
      title={listing?.title || "Booking"}
      location={location}
      meta={`${bookingTravelLabel(booking)} · ${guests}`}
      price={Number(booking.total_usd || 0)}
      priceHint={unpaid ? "to pay" : "paid"}
      actions={
        unpaid ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={payThis}
              disabled={paying}
              className="inline-flex h-7 items-center rounded-full bg-[#22c55e] px-3 text-[11px] font-bold text-white shadow-md shadow-emerald-500/25 hover:bg-[#16a34a] disabled:opacity-60 md:h-8 md:px-3.5 md:text-xs"
            >
              {paying ? "Opening…" : "Make payment"}
            </button>
            <button
              type="button"
              onClick={cancelThis}
              disabled={pending}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 disabled:opacity-60"
            >
              {pending ? "…" : "Cancel"}
            </button>
          </div>
        ) : null
      }
    />
  )
  const className =
    "group flex flex-col h-full overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-shadow md:rounded-3xl"
  if (unpaid || !listingHref) return <div className={className}>{body}</div>
  return (
    <Link href={listingHref} onClick={() => markPageReturn("/trips")} className={className}>
      {body}
    </Link>
  )
}

function PayCountdownRing({ msLeft }: { msLeft: number }) {
  const urgency = payUrgency(msLeft)
  const hoursLabel = formatPayRingHours(msLeft)
  const size = 56
  const stroke = 4.5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const progress = payWindowProgress(msLeft)
  const color = urgency === "red" ? "#f43f5e" : urgency === "amber" ? "#f59e0b" : "#22c55e"
  const track = "rgba(255,255,255,0.35)"
  return (
    <span
      className="relative inline-flex items-center justify-center shrink-0 rounded-full bg-black/45 backdrop-blur-sm shadow-lg"
      style={{ width: size, height: size }}
    >
      <svg className="absolute inset-0 -rotate-90" width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
        />
      </svg>
      <span className="relative text-[13px] font-bold tabular-nums text-white">{hoursLabel}</span>
    </span>
  )
}

function OfferCard({ offer, now }: { offer: any; now: number }) {
  const listing = offerListing(offer)
  const image = listing?.card_image_url || listing?.cover_image_url || "/placeholder.jpg"
  const slug = listing?.slug as string | undefined
  const listingHref =
    listing?.listingPath ||
    (listing?.category_type === "hotel" && slug ? `/hotel/${slug}` : slug ? `/activity/${slug}` : "")
  const live = isAcceptedOfferLive(offer, now)
  const msLeft = live ? offerMsLeft(offer.payment_expires_at, now) : null
  const urgency = live ? payUrgency(msLeft) : null
  const expired = offer.status === "expired" || (offer.status === "accepted" && !live)
  const canPay = live && Boolean(offer.payPath)
  const location = listingPlace(listing)
  const displayStatus = expired && offer.status === "accepted" ? "expired" : offer.status
  const guests = `${offer.guest_count} ${offer.guest_count === 1 ? "guest" : "guests"}`
  const listed = Number(listing?.price_usd || 0)
  const offered = Number(offer.offer_amount)
  const saved = listed > offered ? Math.round(listed - offered) : 0
  const body = (
    <StayCardShell
      image={image}
      badge={canPay ? null : <OfferStatus status={displayStatus} />}
      overlay={canPay && msLeft != null ? <PayCountdownRing msLeft={msLeft} /> : null}
      title={listing?.title || "Listing"}
      location={location}
      meta={
        canPay
          ? `${offerTravelLabel(offer)} · ${guests}`
          : `${offerTravelLabel(offer)} · ${guests}${offerStatusCopy(offer, expired ? 0 : msLeft) ? ` · ${offerStatusCopy(offer, expired ? 0 : msLeft)}` : ""}`
      }
      price={offered}
      priceHint={canPay ? (saved > 0 ? `you save $${saved}` : "your locked deal") : "your offer"}
      actions={
        <span
          className={`inline-flex h-7 items-center rounded-full px-3 text-[11px] font-bold text-white md:h-8 md:px-3.5 md:text-xs ${
            canPay
              ? urgency === "red"
                ? "bg-rose-500 shadow-md shadow-rose-500/25"
                : urgency === "amber"
                  ? "bg-amber-500 shadow-md shadow-amber-500/25"
                  : "bg-[#22c55e] shadow-md shadow-emerald-500/25 hover:bg-[#16a34a]"
              : "bg-zinc-900"
          }`}
        >
          {canPay ? "Make payment" : "View listing"}
        </span>
      }
      footer={
        canPay ? (
          <div className="flex items-center justify-between gap-2 bg-[#FFC72C] px-3.5 py-2">
            <span className="inline-flex items-center gap-1.5 min-w-0">
              <Sparkles className="h-3.5 w-3.5 shrink-0 text-zinc-900" />
              <span className="truncate text-[12px] font-bold uppercase tracking-[0.14em] text-zinc-900">Offer accepted</span>
            </span>
            {msLeft != null ? (
              <span className={`shrink-0 text-[12px] font-bold tabular-nums ${urgency === "red" ? "text-rose-700" : "text-zinc-900"}`}>
                Expires in {formatPayHms(msLeft)}
              </span>
            ) : null}
          </div>
        ) : null
      }
    />
  )

  const className =
    "group flex flex-col h-full overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-shadow md:rounded-3xl"

  const href = canPay ? offer.payPath : listingHref
  if (!href) return <div className={className}>{body}</div>

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={() => markPageReturn("/trips")}
      className={className}
    >
      {body}
    </Link>
  )
}

function OfferGrid({ offers, now }: { offers: any[]; now: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
      {offers.map((offer) => (
        <OfferCard key={offer.id} offer={offer} now={now} />
      ))}
    </div>
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
  const urlTab = searchParams.get("tab") === "wishlist" ? "wishlist" : "trips"
  const [tab, setTab] = useState(urlTab)
  const { user, isSignedIn } = useUser()
  const { favorites, isHydrated } = useFavorites()
  const [saved, setSaved] = useState<HomepageActivity[]>(desk.saved)
  const [ideas, setIdeas] = useState(desk.recommended)
  const [loadingSaved, setLoadingSaved] = useState(desk.saved.length === 0)
  const [offers] = useState<any[]>(desk.offers)
  const [now, setNow] = useState(Date.now())
  const [pastOpen, setPastOpen] = useState(false)
  const [bookings, setBookings] = useState<any[]>(desk.bookings)
  const [clearingUnpaid, startClearUnpaid] = useTransition()
  const [, startTabNav] = useTransition()

  const newestFirst = useMemo(() => [...favorites].reverse(), [favorites])
  const favoriteKey = newestFirst.join(",")

  useEffect(() => {
    setTab(urlTab)
  }, [urlTab])

  useEffect(() => {
    const live = offers.some((offer) => isAcceptedOfferLive(offer))
    if (!live) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [offers])

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
  }, [isHydrated, favoriteKey, desk])

  const locations = [...new Set(saved.map((a) => a.location.replace(", Sri Lanka", "")))]
  const firstName = user?.firstName || desk.firstName || "there"
  const needsYou = offers.filter((o) => isAcceptedOfferLive(o, now))
  const waitingOnHost = offers.filter((o) => o.status === "pending" || o.status === "countered")
  const pastOffers = offers.filter(
    (o) => o.status === "declined" || o.status === "expired" || o.status === "paid" || (o.status === "accepted" && !isAcceptedOfferLive(o, now))
  )
  const liveOfferIds = new Set(needsYou.map((o) => o.id))
  const unpaidBookings = bookings.filter((b) => {
    if (!isUnpaidBooking(String(b.status || ""))) return false
    if (b.offer_id && liveOfferIds.has(b.offer_id)) return false
    return true
  })
  const confirmedBookings = bookings.filter((b) => !isUnpaidBooking(String(b.status || "")))
  const upcomingCount = needsYou.length + waitingOnHost.length + unpaidBookings.length + confirmedBookings.length

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
            onClick={() => {
              setTab("trips")
              startTabNav(() => {
                router.replace("/trips?tab=trips", { scroll: false })
              })
            }}
            className={`cursor-pointer touch-manipulation px-4 py-2 rounded-full text-sm font-semibold transition-transform active:scale-[0.96] ${
              tab === "trips" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            My Trips
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("wishlist")
              startTabNav(() => {
                router.replace("/trips?tab=wishlist", { scroll: false })
              })
            }}
            className={`cursor-pointer touch-manipulation px-4 py-2 rounded-full text-sm font-semibold transition-transform active:scale-[0.96] ${
              tab === "wishlist" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
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

            {loadingSaved && saved.length === 0 ? (
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
            {(needsYou.length > 0 || unpaidBookings.length > 0) && (
              <div className="mb-10">
                <div className="flex items-end justify-between gap-4 mb-1">
                  <h2 className="text-xl font-bold text-zinc-900">Needs payment</h2>
                  {unpaidBookings.length > 0 ? (
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
                          if (!result.cancelled) {
                            toast.error("Those unpaid bookings could not be removed. Try again.")
                            return
                          }
                          setBookings((prev) => prev.filter((b) => !isUnpaidBooking(String(b.status || ""))))
                          router.refresh()
                          toast.success(`Cleared ${result.cancelled} unpaid booking${result.cancelled === 1 ? "" : "s"}`)
                        })
                      }}
                      className="text-sm font-semibold text-zinc-500 hover:text-zinc-900 disabled:opacity-60"
                    >
                      {clearingUnpaid ? "Clearing…" : "Clear unpaid"}
                    </button>
                  ) : null}
                </div>
                <p className="text-sm text-zinc-500 mb-5">
                  Pay to lock these in. Accepted offers expire in 24 hours. Pay-later bookings stay until you pay or cancel.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
                  {needsYou.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} now={now} />
                  ))}
                  {unpaidBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onCancelled={(id) => setBookings((prev) => prev.filter((b) => b.id !== id))}
                    />
                  ))}
                </div>
              </div>
            )}
            {waitingOnHost.length > 0 ? (
              <div className="mb-10">
                <h2 className="text-xl font-bold text-zinc-900 mb-1">Waiting on host</h2>
                <p className="text-sm text-zinc-500 mb-5">Bids you sent. We’ll update this when they reply.</p>
                <OfferGrid offers={waitingOnHost} now={now} />
              </div>
            ) : null}
            {pastOffers.length > 0 ? (
              <div className="mb-10">
                <button
                  type="button"
                  onClick={() => setPastOpen((open) => !open)}
                  className="flex w-full items-center justify-between gap-3 mb-4"
                >
                  <div className="text-left">
                    <h2 className="text-xl font-bold text-zinc-900">Past offers</h2>
                    <p className="text-sm text-zinc-500 mt-0.5">Expired, declined, or already paid.</p>
                  </div>
                  <span className="text-sm font-semibold text-zinc-500">
                    {pastOpen ? "Hide" : `Show ${pastOffers.length}`}
                  </span>
                </button>
                {pastOpen ? <OfferGrid offers={pastOffers} now={now} /> : null}
              </div>
            ) : null}
            {confirmedBookings.length > 0 || (needsYou.length === 0 && unpaidBookings.length === 0 && waitingOnHost.length === 0) ? (
            <>
            <div className="flex items-end justify-between gap-4 mb-2">
              <h2 className="text-xl font-bold text-zinc-900">Confirmed trips</h2>
            </div>
            <p className="text-sm text-zinc-500 mb-5">Paid bookings live here after checkout.</p>
            {confirmedBookings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
                {confirmedBookings.map((booking) => (
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
            </>
            ) : null}
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
