"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { SignInButton, useUser } from "@clerk/nextjs"
import { CalendarDays, CheckCircle2, Loader2, Minus, Plus, X } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { addDays, format, isBefore, startOfToday } from "date-fns"
import { createTransportTripRequest } from "@/app/actions/transport-trips"
import {
  GUIDE_FEE_USD,
  ROUTE_STOPS,
  VEHICLE_ORDER,
  VEHICLE_RATES,
  guidePriceUsd,
  routeDistanceKm,
  routeLabel,
  stopById,
  type RouteStop,
  type VehicleType,
} from "@/lib/transport-route"
import "react-day-picker/dist/style.css"

const RouteIslandMap = dynamic(
  () => import("@/components/transport/RouteIslandMap").then((mod) => mod.RouteIslandMap),
  {
    ssr: false,
    loading: () => <div className="h-full min-h-56 rounded-2xl bg-zinc-200 animate-pulse" />,
  }
)

const fieldClass =
  "w-full h-12 px-3.5 rounded-2xl border border-zinc-200 outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 font-medium text-base text-zinc-900 bg-white"

const sendClass =
  "w-full h-12 rounded-2xl bg-[#FFC72C] hover:bg-[#f0b820] text-zinc-900 text-base font-bold disabled:opacity-60 flex items-center justify-center gap-2"

const labelClass = "mb-2 text-sm font-semibold text-zinc-500"

function stopsFromParam(value: string | null) {
  if (!value) return [] as RouteStop[]
  return value
    .split(",")
    .map((id) => stopById(id.trim()))
    .filter((stop): stop is RouteStop => Boolean(stop))
}

export function TransportPlanClient() {
  const { user, isSignedIn } = useUser()
  const searchParams = useSearchParams()
  const seededFromUrl = useRef(false)
  const [stops, setStops] = useState<RouteStop[]>(() => stopsFromParam(searchParams.get("stops")))
  const [vehicle, setVehicle] = useState<VehicleType>(() => {
    const requested = searchParams.get("vehicle") as VehicleType | null
    return requested && VEHICLE_ORDER.includes(requested) ? requested : "car"
  })
  const [wantsGuide, setWantsGuide] = useState(false)
  const [date, setDate] = useState("")
  const [calOpen, setCalOpen] = useState(false)
  const [guests, setGuests] = useState(2)
  const [offer, setOffer] = useState("")
  const [offerDirty, setOfferDirty] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<{ hostCount: number; route: string } | null>(null)
  const [days, setDays] = useState(1)
  const [requests, setRequests] = useState("")

  const km = routeDistanceKm(stops)
  const guide = stops.length >= 2 ? guidePriceUsd(km, vehicle, wantsGuide) : 0
  const offerAmount = offerDirty ? Number(offer) : guide
  const maxGuests = VEHICLE_RATES[vehicle].maxGuests
  function numbersFor(id: string) {
    return stops.flatMap((stop, index) => (stop.id === id ? [index + 1] : []))
  }

  useEffect(() => {
    if (!user) return
    setName((current) => current || user.fullName || user.firstName || "")
    setEmail((current) => current || user.primaryEmailAddress?.emailAddress || "")
  }, [user])

  useEffect(() => {
    if (seededFromUrl.current) return
    const requested = searchParams.get("vehicle") as VehicleType | null
    const rawStops = searchParams.get("stops")
    const next = stopsFromParam(rawStops)
    if (!rawStops && !requested) return
    seededFromUrl.current = true
    const nextVehicle = requested && VEHICLE_ORDER.includes(requested) ? requested : "car"
    if (nextVehicle !== "car") {
      setVehicle(nextVehicle)
      setGuests((n) => Math.min(n, VEHICLE_RATES[nextVehicle].maxGuests))
    }
    if (next.length) {
      setStops(next)
      setOffer(String(currentGuide(next, nextVehicle, false) || ""))
    }
  }, [searchParams])

  function addStop(stop: RouteStop) {
    setStops((current) => {
      const last = current[current.length - 1]
      if (last?.id === stop.id) return current
      const next = [...current, stop]
      if (!offerDirty && currentGuide(next, vehicle, wantsGuide)) setOffer(String(currentGuide(next, vehicle, wantsGuide)))
      return next
    })
  }

  function tapPlace(stop: RouteStop) {
    addStop(stop)
  }

  function removeLastStop() {
    setStops((current) => current.slice(0, -1))
  }

  function removeStopAt(index: number) {
    setStops((current) => current.filter((_, i) => i !== index))
  }

  function clearRoute() {
    setStops([])
  }

  function pickVehicle(type: VehicleType) {
    setVehicle(type)
    setGuests((n) => Math.min(n, VEHICLE_RATES[type].maxGuests))
    if (!offerDirty) setOffer(String(guidePriceUsd(km, type, wantsGuide) || ""))
  }

  function pickGuide(next: boolean) {
    setWantsGuide(next)
    if (!offerDirty) setOffer(String(guidePriceUsd(km, vehicle, next) || ""))
  }

  function bump(dir: -1 | 1) {
    setOfferDirty(true)
    const base = Number.isFinite(offerAmount) && offerAmount > 0 ? offerAmount : guide || 10
    setOffer(String(Math.max(1, base + dir * (guide >= 50 ? 5 : 1))))
  }

  async function submit() {
    setError(null)
    if (stops.length < 2) {
      setError("Pick at least a pickup and one destination.")
      return
    }
    if (!date) {
      setError("Choose a travel date.")
      return
    }
    const amount = Number(offerDirty ? offer : guide)
    setSending(true)
    const result = await createTransportTripRequest({
      vehicleType: vehicle,
      wantsGuide,
      stopIds: stops.map((stop) => stop.id),
      travelDate: date,
      guestCount: Math.min(maxGuests, guests),
      tripDays: days,
      offerAmount: amount,
      guestName: name,
      guestEmail: email,
      guestPhone: phone,
      guestRequests: requests,
    })
    setSending(false)
    if (!result.success) {
      setError(result.error || "Could not send this route.")
      return
    }
    setSent({ hostCount: result.hostCount || 0, route: routeLabel(stops) })
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-24 pb-28">
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-900">Route sent</h1>
          <p className="text-zinc-500 mt-2">
            {sent.route} went to {sent.hostCount} {VEHICLE_RATES[vehicle].label.toLowerCase()} host
            {sent.hostCount === 1 ? "" : "s"}. You’ll only hear back if someone accepts — then you have 24 hours to pay.
          </p>
          <Link
            href="/trips?tab=trips"
            className={`mt-6 inline-flex ${sendClass} max-w-xs mx-auto`}
          >
            Track it in Trips
          </Link>
        </div>
      </div>
    )
  }

  const ready = stops.length >= 2

  const sendButton = isSignedIn ? (
    <button type="button" disabled={sending || !ready} onClick={submit} className={sendClass}>
      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : ready ? `Send offer${guide ? ` · $${offerDirty ? offer || guide : guide}` : ""}` : "Add two places first"}
    </button>
  ) : (
    <SignInButton mode="modal">
      <button type="button" className={sendClass}>
        Sign in to send
      </button>
    </SignInButton>
  )

  const detailsForm = (
    <div className="space-y-4">
      <div>
        <p className={labelClass}>Vehicle</p>
        <div className="flex gap-2">
          {VEHICLE_ORDER.map((type) => {
            const selected = vehicle === type
            const meta = VEHICLE_RATES[type]
            return (
              <button
                key={type}
                type="button"
                title={meta.label}
                onClick={() => pickVehicle(type)}
                className={`flex h-16 min-w-0 flex-1 flex-col items-center justify-center rounded-2xl transition ${
                  selected ? "bg-white ring-2 ring-zinc-900 text-zinc-900" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {meta.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={meta.icon} alt="" className="h-8 w-8 object-contain" />
                ) : null}
                <span className="mt-1 text-xs font-semibold leading-tight">{meta.label}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => pickGuide(false)}
            className={`h-12 rounded-2xl text-sm font-semibold ${!wantsGuide ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`}
          >
            Driver only
          </button>
          <button
            type="button"
            onClick={() => pickGuide(true)}
            className={`h-12 rounded-2xl text-sm font-semibold ${wantsGuide ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`}
          >
            + Guide ${GUIDE_FEE_USD}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className={labelClass}>Days</p>
          <div className="flex h-12 items-center justify-between rounded-2xl border border-zinc-200 px-1">
            <button type="button" className="flex h-10 w-10 items-center justify-center" onClick={() => setDays((n) => Math.max(1, n - 1))} aria-label="Fewer days">
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-base font-bold tabular-nums">{days}</span>
            <button type="button" className="flex h-10 w-10 items-center justify-center" onClick={() => setDays((n) => Math.min(14, n + 1))} aria-label="More days">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div>
          <p className={labelClass}>Guests</p>
          <div className="flex h-12 items-center justify-between rounded-2xl border border-zinc-200 px-1">
            <button type="button" className="flex h-10 w-10 items-center justify-center" onClick={() => setGuests((n) => Math.max(1, n - 1))} aria-label="Fewer guests">
              <Minus className="h-5 w-5" />
            </button>
            <span className="text-base font-bold tabular-nums">{Math.min(guests, maxGuests)}</span>
            <button type="button" className="flex h-10 w-10 items-center justify-center" onClick={() => setGuests((n) => Math.min(maxGuests, n + 1))} aria-label="More guests">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <p className={labelClass}>Start date</p>
        <button type="button" onClick={() => setCalOpen(true)} className={`${fieldClass} inline-flex items-center gap-2 text-left`}>
          <CalendarDays className="h-5 w-5 shrink-0 text-zinc-500" />
          <span className="truncate font-semibold">{date ? format(new Date(`${date}T12:00:00`), "d MMM yyyy") : "Pick a date"}</span>
        </button>
      </div>

      <div>
        <p className={labelClass}>Your offer</p>
        <div className={`flex h-16 items-center rounded-2xl border ${ready ? "border-zinc-900 bg-white" : "border-zinc-200 bg-zinc-50"}`}>
          <button type="button" disabled={!ready} onClick={() => bump(-1)} className="flex h-16 w-14 shrink-0 items-center justify-center text-zinc-800 disabled:text-zinc-300" aria-label="Lower offer">
            <Minus className="h-6 w-6" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5">
            <span className="text-xl font-black text-zinc-900">$</span>
            <input
              className="h-14 w-28 bg-transparent text-center text-3xl font-black tabular-nums text-zinc-900 outline-none disabled:text-zinc-400"
              inputMode="numeric"
              disabled={!ready}
              aria-label="Offer amount"
              value={ready ? (offerDirty ? offer : String(guide || "")) : ""}
              placeholder="—"
              onChange={(e) => {
                setOfferDirty(true)
                setOffer(e.target.value.replace(/[^\d]/g, ""))
              }}
            />
          </div>
          <button type="button" disabled={!ready} onClick={() => bump(1)} className="flex h-16 w-14 shrink-0 items-center justify-center text-zinc-800 disabled:text-zinc-300" aria-label="Raise offer">
            <Plus className="h-6 w-6" />
          </button>
        </div>
        <p className="mt-2 text-sm leading-snug text-zinc-500">
          {ready ? "Suggested from distance. Hosts see this number — no payment until one accepts." : "Tap two places on the map or below to unlock a price."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <input className={fieldClass} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className={fieldClass} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={fieldClass} placeholder="WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <textarea
          className={`${fieldClass} h-16 resize-none py-2.5 leading-snug`}
          placeholder="Anything the host should know…"
          value={requests}
          maxLength={500}
          onChange={(e) => setRequests(e.target.value)}
          aria-label="Requests for the host"
        />
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      <div className="hidden lg:block space-y-2">
        {sendButton}
        <p className="text-center text-sm text-zinc-400">No payment yet.</p>
      </div>
    </div>
  )

  const mapBlock = (
    <div className="h-full min-h-0 overflow-hidden bg-zinc-900 lg:rounded-[1.75rem]">
      <RouteIslandMap
        stops={stops}
        onAdd={tapPlace}
        onRemoveLast={() => removeLastStop()}
        className="h-full"
      />
    </div>
  )

  const itinerary =
    stops.length === 0 ? null : (
      <ol className="space-y-0">
        {stops.map((stop, index) => (
          <li key={`${stop.id}-${index}`} className="flex gap-3">
            <div className="flex w-7 flex-col items-center">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 text-xs font-bold text-white">
                {index + 1}
              </span>
              {index < stops.length - 1 ? <span className="w-px flex-1 bg-zinc-200" /> : null}
            </div>
            <div className={`flex min-w-0 flex-1 items-center gap-2 pb-3 ${index === stops.length - 1 ? "pb-0" : ""}`}>
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-200">
                {stop.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={stop.image} alt="" className="h-full w-full object-cover" />
                ) : null}
              </div>
              <span className="min-w-0 flex-1 truncate text-base font-semibold text-zinc-900">{stop.name}</span>
              <button type="button" onClick={() => removeStopAt(index)} className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" aria-label={`Remove ${stop.name}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </li>
        ))}
      </ol>
    )

  const placePicker = (
    <div className="flex gap-2.5 overflow-x-auto py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:gap-2.5 lg:overflow-visible">
      {ROUTE_STOPS.map((stop) => {
        const numbers = numbersFor(stop.id)
        const onRoute = numbers.length > 0
        return (
          <button
            key={stop.id}
            type="button"
            onClick={() => tapPlace(stop)}
            title={`Add ${stop.name}`}
            className="w-[5.75rem] shrink-0 text-left lg:w-auto"
          >
            <span
              className={`relative block aspect-square w-full rounded-2xl bg-zinc-200 p-[3px] ${
                onRoute ? "bg-zinc-900" : "bg-zinc-200"
              }`}
            >
              <span className="relative block h-full w-full overflow-hidden rounded-[13px] bg-zinc-200">
                {stop.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={stop.image} alt="" className="h-full w-full object-cover" />
                ) : null}
                {onRoute ? (
                  <span className="absolute left-1 top-1 rounded-full bg-zinc-900 px-1.5 text-xs font-bold leading-5 text-white">
                    {numbers.join("·")}
                  </span>
                ) : null}
              </span>
            </span>
            <span className="mt-1.5 block truncate text-sm font-semibold text-zinc-800">{stop.name.replace("Colombo Airport (CMB)", "Airport")}</span>
          </button>
        )
      })}
    </div>
  )

  const calendar =
    calOpen && typeof document !== "undefined"
      ? createPortal(
          <div className="fixed inset-0 z-[999999] flex items-end justify-center p-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))] lg:items-center">
            <button
              type="button"
              className="absolute inset-0 bg-zinc-900/45"
              aria-label="Close calendar"
              onClick={() => setCalOpen(false)}
            />
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-3 shadow-2xl">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-base font-bold text-zinc-900">Start date</p>
                <button type="button" onClick={() => setCalOpen(false)} className="rounded-full p-1 text-zinc-400" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <DayPicker
                mode="single"
                selected={date ? new Date(`${date}T12:00:00`) : undefined}
                onSelect={(day) => {
                  if (!day) return
                  setDate(format(day, "yyyy-MM-dd"))
                  setCalOpen(false)
                }}
                disabled={(day) => isBefore(day, addDays(startOfToday(), 1))}
                classNames={{ selected: "bg-[#FFC72C] text-zinc-900 font-bold", today: "text-amber-600 font-bold" }}
              />
            </div>
          </div>,
          document.body
        )
      : null

  const tripPanel = (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 pb-4">
        <p className="text-sm font-semibold text-zinc-500">Your trip</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Plan a route</h1>
          {km > 0 ? <p className="text-sm font-semibold text-zinc-500">{stops.length} stops · {km} km</p> : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pb-4 lg:pr-1">
        {stops.length > 0 ? (
          <section>
            {itinerary}
            <button type="button" onClick={clearRoute} className="mt-3 text-sm font-semibold text-zinc-500 hover:text-zinc-800">
              Clear route
            </button>
          </section>
        ) : null}
        <section>
          <p className={labelClass}>Add a place</p>
          {placePicker}
        </section>
        <section>{detailsForm}</section>
      </div>
    </div>
  )

  return (
    <div className="w-full bg-zinc-50 lg:min-h-screen">
      {calendar}
      <div className="lg:mx-auto lg:grid lg:h-[calc(100dvh-4.25rem)] lg:max-w-[1600px] lg:grid-cols-[minmax(22rem,28rem)_minmax(0,1fr)] lg:gap-5 lg:px-5 lg:py-4">
        <div className="h-[min(52svh,28rem)] lg:order-2 lg:h-full">{mapBlock}</div>
        <section className={`relative z-10 -mt-6 min-h-0 rounded-t-[1.75rem] bg-white px-4 pt-5 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] lg:order-1 lg:mt-0 lg:flex lg:h-full lg:flex-col lg:rounded-[1.75rem] lg:border lg:border-zinc-100 lg:p-5 lg:pb-5 lg:shadow-[0_12px_40px_rgba(15,15,15,0.06)] ${ready ? "pb-[max(5.75rem,env(safe-area-inset-bottom,0px))]" : "pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]"}`}>
          {tripPanel}
        </section>
      </div>

      {ready ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-zinc-100 bg-white/95 px-4 py-3 backdrop-blur lg:hidden" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          {sendButton}
        </div>
      ) : null}
    </div>
  )
}

function currentGuide(stops: RouteStop[], vehicle: VehicleType, withGuide: boolean) {
  if (stops.length < 2) return 0
  return guidePriceUsd(routeDistanceKm(stops), vehicle, withGuide)
}
