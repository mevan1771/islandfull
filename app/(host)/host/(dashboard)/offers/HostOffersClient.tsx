"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import { respondToHostOffer } from "@/app/actions/offers"
import { respondToTripRecipient } from "@/app/actions/transport-trips"
import { travelRangeFromOffer } from "@/lib/date-range-label"
import { formatPayRemaining, isAcceptedOfferLive, offerMsLeft, payUrgency } from "@/lib/offer-countdown"

type HostOffer = {
  id: string
  source?: "trip" | "listing"
  status: string
  offer_amount: number
  travel_date: string
  guest_count: number
  special_notes?: string | null
  created_at: string
  payment_expires_at?: string | null
  listingTitle: string
  listingKind: string
  listingImage: string | null
  guestName: string | null
  guestEmail: string | null
  guestPhone: string | null
}

const STATUS: Record<string, string> = {
  pending: "bg-[#faca20] text-zinc-900",
  accepted: "bg-emerald-100 text-emerald-800",
  countered: "bg-sky-100 text-sky-800",
  declined: "bg-zinc-100 text-zinc-600",
  expired: "bg-zinc-100 text-zinc-600",
  paid: "bg-emerald-100 text-emerald-800",
}

function OfferRow({
  offer,
  busy,
  onRespond,
}: {
  offer: HostOffer
  busy: boolean
  onRespond: (id: string, status: "accepted" | "declined") => void
}) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (offer.status !== "accepted" || !offer.payment_expires_at) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [offer.status, offer.payment_expires_at])
  const ms = offer.status === "accepted" ? offerMsLeft(offer.payment_expires_at, now) : null
  const urgency = payUrgency(ms)
  const waitCopy =
    offer.status === "accepted"
      ? urgency === "expired"
        ? "Payment window ended"
        : `Guest has ${formatPayRemaining(ms)} to pay`
      : null

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 space-y-3">
      <div className="flex gap-3">
        <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-zinc-100">
          {offer.listingImage ? (
            <Image src={offer.listingImage} alt="" fill className="object-cover" sizes="64px" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-zinc-900 truncate">{offer.listingTitle}</p>
              <p className="text-[11px] uppercase tracking-wide text-zinc-400">{offer.listingKind}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${STATUS[offer.status] || STATUS.pending}`}>
              {offer.status}
            </span>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            {travelRangeFromOffer(offer.travel_date, offer.special_notes)} · {offer.guest_count}{" "}
            {offer.guest_count === 1 ? "guest" : "guests"}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xl font-black text-zinc-900">${Number(offer.offer_amount)}</p>
          {waitCopy ? (
            <p className={`text-xs font-semibold mt-0.5 ${urgency === "red" ? "text-rose-600" : "text-zinc-500"}`}>
              {waitCopy}
            </p>
          ) : (
            <p className="text-xs text-zinc-400">their offer</p>
          )}
          {offer.guestName ? (
            <p className="text-xs text-zinc-500 mt-1">
              {offer.guestName}
              {offer.guestEmail ? ` · ${offer.guestEmail}` : ""}
            </p>
          ) : offer.status !== "paid" ? (
            <p className="text-xs text-zinc-400 mt-1">Guest details after payment</p>
          ) : null}
        </div>
        {offer.status === "pending" ? (
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              disabled={busy}
              onClick={() => onRespond(offer.id, "accepted")}
              className="h-10 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold disabled:opacity-50"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Accept"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onRespond(offer.id, "declined")}
              className="h-10 px-3 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold disabled:opacity-50"
            >
              Decline
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function HostOffersClient({ initialOffers }: { initialOffers: HostOffer[] }) {
  const [offers, setOffers] = useState(initialOffers)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [pastOpen, setPastOpen] = useState(false)

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const live = offers.some((offer) => isAcceptedOfferLive(offer))
    if (!live) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [offers])
  const needsYou = useMemo(() => offers.filter((o) => o.status === "pending"), [offers])
  const waiting = useMemo(
    () => offers.filter((o) => o.status === "countered" || isAcceptedOfferLive(o, now)),
    [offers, now]
  )
  const past = useMemo(
    () =>
      offers.filter(
        (o) =>
          o.status === "declined" ||
          o.status === "expired" ||
          o.status === "paid" ||
          (o.status === "accepted" && !isAcceptedOfferLive(o, now))
      ),
    [offers, now]
  )

  async function onRespond(id: string, status: "accepted" | "declined") {
    setBusyId(id)
    const target = offers.find((item) => item.id === id)
    const res =
      target?.source === "trip"
        ? await respondToTripRecipient(id, status)
        : await respondToHostOffer(id, status)
    setBusyId(null)
    if (!res.success) {
      toast.error(res.error || "Could not update offer.")
      return
    }
    setOffers((current) =>
      current.map((offer) =>
        offer.id === id
          ? {
              ...offer,
              status,
              payment_expires_at:
                status === "accepted" ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
            }
          : offer
      )
    )
    toast.success(status === "accepted" ? "Guest has 24 hours to pay" : "Offer declined")
  }

  if (offers.length === 0) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-100 text-center">
        <h3 className="text-xl font-bold text-zinc-900 mb-2">No offers yet</h3>
        <p className="text-zinc-500 max-w-sm mx-auto">When a guest bids on your listing, it will show up here.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Needs you</h3>
        {needsYou.length ? (
          <div className="space-y-3">
            {needsYou.map((offer) => (
              <OfferRow key={offer.id} offer={offer} busy={busyId === offer.id} onRespond={onRespond} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500 bg-white border border-zinc-100 rounded-2xl p-5">Nothing waiting on you.</p>
        )}
      </section>

      {waiting.length > 0 ? (
        <section>
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-3">Waiting on guest</h3>
          <div className="space-y-3">
            {waiting.map((offer) => (
              <OfferRow key={offer.id} offer={offer} busy={false} onRespond={onRespond} />
            ))}
          </div>
        </section>
      ) : null}

      {past.length > 0 ? (
        <section>
          <button
            type="button"
            onClick={() => setPastOpen((open) => !open)}
            className="flex w-full items-center justify-between text-sm font-bold text-zinc-500 uppercase tracking-wider"
          >
            Past offers
            <span className="normal-case font-semibold text-zinc-400">{past.length}</span>
          </button>
          {pastOpen ? (
            <div className="space-y-3 mt-3">
              {past.map((offer) => (
                <OfferRow key={offer.id} offer={offer} busy={false} onRespond={onRespond} />
              ))}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
