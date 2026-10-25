"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { SignInButton, useUser } from "@clerk/nextjs"
import { ArrowLeft, CalendarDays, CheckCircle2, Loader2, Minus, Plus, X } from "lucide-react"
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
  "w-full h-10 px-3 rounded-xl border border-zinc-200 outline-none focus:border-[#FFC72C] focus:ring-2 focus:ring-[#FFC72C]/30 font-medium text-sm text-zinc-900 bg-white"

const sendClass =
  "w-full h-11 rounded-xl bg-[#FFC72C] hover:bg-[#f0b820] text-zinc-900 font-bold disabled:opacity-60 flex items-center justify-center gap-2"

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
  const [picked, setPicked] = useState<RouteStop | null>(null)

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
    if (stops.some((item) => item.id === stop.id)) {
      setPicked(stop)
      return
    }
    setPicked(null)
    addStop(stop)
  }

  function visitAgain(stop: RouteStop) {
    addStop(stop)
    setPicked(null)
  }

  function removeLastOf(id: string) {
    setStops((current) => {
      const index = current.map((item) => item.id).lastIndexOf(id)
      if (index < 0) return current
      return current.filter((_, i) => i !== index)
    })
    setPicked(null)
  }

  function removeLastStop() {
    setStops((current) => current.slice(0, -1))
  }

  function removeStopAt(index: number) {
    setStops((current) => current.filter((_, i) => i !== index))
  }

  function clearRoute() {
    setStops([])
    setPicked(null)
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

  const renderBook = (embedded = false, hideSend = false) => (
    <div className={embedded ? "space-y-3" : "bg-white rounded-3xl border border-zinc-100 shadow-sm p-4 space-y-3"}>
      <div>
        {embedded ? null : <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">Your offer</p>}
        <div className={`flex items-center rounded-xl border-2 border-[#FFC72C] bg-[#FFF8E1] ${embedded ? "h-11" : "h-12"}`}>
          <button
            type="button"
            onClick={() => bump(-1)}
            className={`flex shrink-0 items-center justify-center text-zinc-800 ${embedded ? "h-11 w-10" : "h-12 w-12"}`}
            aria-label="Lower offer"
          >
            <Minus className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5">
            <span className={`font-black text-zinc-900 ${embedded ? "text-base" : "text-lg"}`}>$</span>
            <input
              className={`w-20 bg-transparent text-center font-black tabular-nums text-zinc-900 outline-none ${embedded ? "h-10 text-lg" : "h-11 text-xl"}`}
              inputMode="numeric"
              aria-label="Offer amount"
              value={offerDirty ? offer : guide || ""}
              onChange={(e) => {
                setOfferDirty(true)
                setOffer(e.target.value.replace(/[^\d]/g, ""))
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => bump(1)}
            className={`flex shrink-0 items-center justify-center text-zinc-800 ${embedded ? "h-11 w-10" : "h-12 w-12"}`}
            aria-label="Raise offer"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          {embedded ? null : <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">Days</p>}
          <div className="flex h-10 items-center justify-between rounded-xl border border-zinc-200 px-1">
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg" onClick={() => setDays((n) => Math.max(1, n - 1))} aria-label="Fewer days">
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold tabular-nums">{days}d</span>
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg" onClick={() => setDays((n) => Math.min(14, n + 1))} aria-label="More days">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div>
          {embedded ? null : <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-zinc-500">Guests</p>}
          <div className="flex h-10 items-center justify-between rounded-xl border border-zinc-200 px-1">
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg" onClick={() => setGuests((n) => Math.max(1, n - 1))} aria-label="Fewer guests">
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm font-bold tabular-nums">{Math.min(guests, maxGuests)}</span>
            <button type="button" className="flex h-8 w-8 items-center justify-center rounded-lg" onClick={() => setGuests((n) => Math.min(maxGuests, n + 1))} aria-label="More guests">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1">
        {VEHICLE_ORDER.map((type) => {
          const selected = vehicle === type
          const meta = VEHICLE_RATES[type]
          return (
            <button
              key={type}
              type="button"
              title={meta.label}
              onClick={() => pickVehicle(type)}
              className={`flex h-12 min-w-0 flex-1 flex-col items-center justify-center rounded-xl ${
                selected ? "bg-[#FFF8E1] ring-2 ring-[#FFC72C]" : "bg-zinc-50 hover:bg-zinc-100"
              }`}
            >
              {meta.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.icon} alt="" className="h-7 w-7 object-contain" />
              ) : null}
              <span className={`text-[10px] leading-none mt-0.5 ${selected ? "font-bold text-zinc-900" : "font-medium text-zinc-500"}`}>
                {meta.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => pickGuide(false)}
          className={`h-9 rounded-lg text-xs font-semibold ${
            !wantsGuide ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          No guide
        </button>
        <button
          type="button"
          onClick={() => pickGuide(true)}
          className={`h-9 rounded-lg text-xs font-semibold ${
            wantsGuide ? "bg-[#FFC72C] text-zinc-900" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          Guide · +${GUIDE_FEE_USD}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setCalOpen(true)}
        className={`${fieldClass} inline-flex items-center gap-1.5 px-3 text-left truncate`}
      >
        <CalendarDays className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
        <span className="truncate">{date ? format(new Date(`${date}T12:00:00`), "d MMM") : "Start date"}</span>
      </button>

      <div className="grid grid-cols-1 gap-2">
        <input className={fieldClass} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className={fieldClass} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={fieldClass} placeholder="WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <textarea
          className={`${fieldClass} h-[4.5rem] resize-none py-2.5 leading-snug`}
          placeholder="Requests for the host — child seat, hotel pickup, luggage…"
          value={requests}
          maxLength={500}
          onChange={(e) => setRequests(e.target.value)}
          aria-label="Requests for the host"
        />
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

      {hideSend ? null : (
        <>
          {isSignedIn ? (
            <button type="button" disabled={sending} onClick={submit} className={sendClass}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Offer"}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button type="button" className={sendClass}>
                Sign in to send
              </button>
            </SignInButton>
          )}
          <p className="text-center text-[11px] text-zinc-400">No payment yet. 24 hours to pay if a host accepts.</p>
        </>
      )}
    </div>
  )

  const mapBlock = (
    <div className="h-full min-h-0 overflow-hidden bg-zinc-900 lg:rounded-3xl lg:shadow-xl lg:border lg:border-zinc-800">
      <RouteIslandMap
        stops={stops}
        onAdd={tapPlace}
        onRemoveLast={() => removeLastStop()}
        className="h-full"
      />
    </div>
  )

  const desktopSelected = stops.length > 0 ? (
    <div className="flex flex-col gap-1.5 pb-3">
      {stops.map((stop, index) => (
        <div key={`${stop.id}-${index}`} className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white p-1.5">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
            {stop.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={stop.image} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="block h-full w-full bg-zinc-200" />
            )}
            <span className="absolute left-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
              {index + 1}
            </span>
          </div>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-zinc-900">{stop.name}</span>
          <button type="button" onClick={() => removeStopAt(index)} className="p-1.5 text-zinc-400 hover:text-zinc-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  ) : null

  const desktopPlaces = (
    <div className="grid grid-cols-1 gap-2">
      {ROUTE_STOPS.map((stop) => {
        const numbers = numbersFor(stop.id)
        return (
          <button
            key={stop.id}
            type="button"
            onClick={() => tapPlace(stop)}
            className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-2 pr-3 text-left hover:shadow-sm ${
              numbers.length ? "border-zinc-900" : "border-zinc-100 hover:border-zinc-300"
            }`}
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
              {stop.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={stop.image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="block h-full w-full bg-zinc-200" />
              )}
              {numbers.length > 0 ? (
                <span className="absolute left-0.5 top-0.5 rounded-full bg-zinc-900 px-1.5 text-[10px] font-bold leading-5 text-white">
                  {numbers.join("·")}
                </span>
              ) : null}
            </div>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-zinc-900">{stop.name}</span>
              <span className="block truncate text-xs leading-tight text-zinc-500">
                {numbers.length ? `Stop ${numbers.join(" · ")}` : stop.blurb || "Add to route"}
              </span>
            </span>
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
                <p className="text-sm font-bold text-zinc-900">Start date</p>
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

  const pickedBar =
    picked && numbersFor(picked.id).length > 0 ? (
      <div className="mb-3 flex items-center gap-2 rounded-2xl bg-zinc-100 px-3 py-2">
        <p className="min-w-0 flex-1 text-xs font-medium text-zinc-600">
          <span className="font-bold text-zinc-900">{picked.name}</span> is already on your route
        </p>
        <button type="button" onClick={() => visitAgain(picked)} className="shrink-0 text-xs font-bold text-zinc-900">
          Add again
        </button>
        <button type="button" onClick={() => removeLastOf(picked.id)} className="shrink-0 text-xs font-semibold text-zinc-500">
          Remove
        </button>
      </div>
    ) : null

  const locationRail = (
    <div>
      <div className="mb-2 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ROUTE_STOPS.map((stop) => {
          const numbers = numbersFor(stop.id)
          return (
            <button
              key={stop.id}
              type="button"
              onClick={() => tapPlace(stop)}
              title={numbers.length ? `${stop.name} is on your route` : `Add ${stop.name}`}
              className="w-[4.75rem] shrink-0 text-center"
            >
              <span
                className={`relative block aspect-square w-full overflow-hidden rounded-2xl bg-zinc-200 ${
                  numbers.length ? "ring-2 ring-zinc-900 ring-offset-1" : picked?.id === stop.id ? "ring-2 ring-[#FFC72C] ring-offset-1" : ""
                }`}
              >
                {stop.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={stop.image} alt="" className="h-full w-full object-cover" />
                ) : null}
                {numbers.length > 0 ? (
                  <span className="absolute left-1 top-1 rounded-full bg-zinc-900 px-1.5 text-[10px] font-bold leading-5 text-white">
                    {numbers.join("·")}
                  </span>
                ) : null}
              </span>
              <span className="mt-1 block truncate text-[11px] font-semibold text-zinc-900">{stop.name}</span>
            </button>
          )
        })}
      </div>
      {pickedBar}
      {stops.length > 0 ? (
        <button type="button" onClick={clearRoute} className="mb-3 text-xs font-semibold text-zinc-400">
          Clear route
        </button>
      ) : null}
    </div>
  )

  return (
    <div className="w-full bg-zinc-50 lg:min-h-screen">
      {calendar}
      <div className="lg:mx-auto lg:grid lg:h-[calc(100dvh-4.25rem)] lg:max-w-[1680px] lg:grid-cols-[minmax(18rem,21rem)_minmax(16.5rem,19rem)_minmax(0,1fr)] lg:gap-4 lg:overflow-visible lg:px-5 lg:pt-4 xl:gap-5">
        <div className="h-[calc(100svh-14rem)] lg:order-3 lg:h-full">{mapBlock}</div>

        <section className="hidden min-h-0 min-w-0 lg:order-2 lg:flex lg:h-full lg:flex-col">
          <div className="shrink-0 pb-3">
            <Link href="/?vertical=transport" className="mb-1 inline-flex items-center gap-1 text-sm font-semibold text-zinc-500">
              <ArrowLeft className="h-4 w-4" /> Transport
            </Link>
            <h1 className="text-2xl font-black tracking-tight text-zinc-900">Plan a route</h1>
            {km > 0 ? (
              <p className="mt-1 text-xs text-zinc-500">
                {stops.length} stops · {km} km
              </p>
            ) : (
              <p className="mt-1 text-xs text-zinc-500">Tap a place or a pin on the map</p>
            )}
          </div>
          {desktopSelected}
          <div className="min-h-0 flex-1 overflow-y-auto pb-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
              {stops.length === 0 ? "Start with a pickup" : "Add another stop"}
            </p>
            {pickedBar}
            {desktopPlaces}
          </div>
        </section>

        <aside className="hidden min-h-0 min-w-0 lg:order-1 lg:block lg:h-full lg:overflow-y-auto">{renderBook()}</aside>

        <section className="relative z-10 -mt-5 rounded-t-[1.75rem] bg-white px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] lg:hidden">
          {locationRail}
          {renderBook(true)}
          {stops.length < 2 ? (
            <p className="mt-3 text-center text-xs text-zinc-500">Pick a pickup and one more stop</p>
          ) : null}
        </section>
      </div>
    </div>
  )
}

function currentGuide(stops: RouteStop[], vehicle: VehicleType, withGuide: boolean) {
  if (stops.length < 2) return 0
  return guidePriceUsd(routeDistanceKm(stops), vehicle, withGuide)
}
