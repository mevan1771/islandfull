"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { SignInButton, useUser } from "@clerk/nextjs"
import { ArrowLeft, CalendarDays, CheckCircle2, Loader2, Minus, Plus, X } from "lucide-react"
import { DayPicker } from "react-day-picker"
import * as Popover from "@radix-ui/react-popover"
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

export function TransportPlanClient() {
  const { user, isSignedIn } = useUser()
  const [stops, setStops] = useState<RouteStop[]>([])
  const [vehicle, setVehicle] = useState<VehicleType>("car")
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

  const km = routeDistanceKm(stops)
  const guide = stops.length >= 2 ? guidePriceUsd(km, vehicle, wantsGuide) : 0
  const offerAmount = offerDirty ? Number(offer) : guide
  const maxGuests = VEHICLE_RATES[vehicle].maxGuests
  const available = ROUTE_STOPS.filter((stop) => !stops.some((s) => s.id === stop.id))

  useEffect(() => {
    if (!user) return
    setName((current) => current || user.fullName || user.firstName || "")
    setEmail((current) => current || user.primaryEmailAddress?.emailAddress || "")
  }, [user])

  function addStop(stop: RouteStop) {
    setStops((current) => {
      if (current.some((item) => item.id === stop.id)) return current
      const next = [...current, stop]
      if (!offerDirty && currentGuide(next, vehicle, wantsGuide)) setOffer(String(currentGuide(next, vehicle, wantsGuide)))
      return next
    })
  }

  function removeStop(id: string) {
    setStops((current) => current.filter((stop) => stop.id !== id))
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
      offerAmount: amount,
      guestName: name,
      guestEmail: email,
      guestPhone: phone,
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

  const renderBook = () => (
    <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-4 space-y-3">
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

      <div className="grid grid-cols-3 gap-2">
        <Popover.Root open={calOpen} onOpenChange={setCalOpen}>
          <Popover.Trigger asChild>
            <button type="button" className={`${fieldClass} col-span-1 text-left truncate inline-flex items-center gap-1.5 px-2`}>
              <CalendarDays className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
              <span className="truncate">{date ? format(new Date(`${date}T12:00:00`), "d MMM") : "Date"}</span>
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className="z-[999999] bg-white rounded-2xl shadow-xl border border-zinc-100 p-2">
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
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
        <div className="flex h-10 items-center justify-between rounded-xl border border-zinc-200 px-1">
          <button type="button" className="w-8 h-8 rounded-lg text-base font-bold" onClick={() => setGuests((n) => Math.max(1, n - 1))}>
            −
          </button>
          <span className="text-sm font-bold tabular-nums">{Math.min(guests, maxGuests)}</span>
          <button type="button" className="w-8 h-8 rounded-lg text-base font-bold" onClick={() => setGuests((n) => Math.min(maxGuests, n + 1))}>
            +
          </button>
        </div>
        <div className="flex h-10 items-center rounded-xl border border-[#FFC72C] bg-[#FFF8E1] px-2">
          <span className="text-sm font-bold text-zinc-900">$</span>
          <input
            className="h-9 w-full min-w-0 bg-transparent pl-1 text-sm font-bold tabular-nums outline-none"
            inputMode="numeric"
            placeholder="Offer"
            value={offerDirty ? offer : guide || ""}
            onChange={(e) => {
              setOfferDirty(true)
              setOffer(e.target.value.replace(/[^\d]/g, ""))
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <input className={fieldClass} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          <input className={fieldClass} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={fieldClass} placeholder="WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

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
    </div>
  )

  const mapBlock = (
    <div className="h-full min-h-0 overflow-hidden bg-zinc-900 lg:rounded-3xl lg:shadow-xl lg:border lg:border-zinc-800">
      <RouteIslandMap
        stops={stops}
        onAdd={addStop}
        onRemoveLast={removeStop}
        className="h-full"
      />
    </div>
  )

  return (
    <div className="w-full bg-zinc-50 lg:min-h-screen lg:pb-0">
      <div className="flex h-[calc(100dvh-4rem)] flex-col lg:mx-auto lg:grid lg:h-[calc(100dvh-4.25rem)] lg:max-w-[1680px] lg:grid-cols-[minmax(18rem,21rem)_minmax(16.5rem,19rem)_minmax(0,1fr)] lg:gap-4 lg:px-5 lg:pt-4 xl:gap-5">
        <div className="order-1 h-[34svh] min-h-[11rem] shrink-0 lg:order-3 lg:h-full lg:min-h-0">
          {mapBlock}
        </div>

        <div className="relative z-10 order-2 -mt-4 flex min-h-0 flex-1 flex-col overflow-y-auto rounded-t-3xl bg-zinc-50 px-4 pb-[5.75rem] pt-2 shadow-[0_-12px_32px_rgba(0,0,0,.16)] md:px-8 lg:contents lg:mt-0 lg:overflow-visible lg:rounded-none lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-0 lg:shadow-none">
          <div className="mx-auto mb-2 h-1 w-10 shrink-0 rounded-full bg-zinc-300 lg:hidden" />

          <section className="min-w-0 shrink-0 lg:order-2 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
            <div className="shrink-0 pb-3">
              <Link href="/?vertical=transport" className="mb-1 hidden items-center gap-1 text-sm font-semibold text-zinc-500 lg:inline-flex">
                <ArrowLeft className="h-4 w-4" /> Transport
              </Link>
              <h1 className="text-lg font-black tracking-tight text-zinc-900 lg:text-2xl">Plan a route</h1>
              {km > 0 ? (
                <p className="mt-1 text-xs text-zinc-500">
                  {stops.length} stops · {km} km
                </p>
              ) : (
                <p className="mt-1 text-xs text-zinc-500">Tap a place or a pin on the map</p>
              )}
            </div>

            {stops.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:overflow-visible lg:gap-1.5">
                {stops.map((stop, index) => (
                  <div
                    key={stop.id}
                    className="relative w-[4.25rem] shrink-0 lg:flex lg:w-auto lg:items-center lg:gap-2 lg:rounded-2xl lg:border lg:border-zinc-200 lg:bg-white lg:p-1.5"
                  >
                    <div className="relative h-14 w-full overflow-hidden rounded-2xl lg:h-12 lg:w-12 lg:shrink-0 lg:rounded-xl">
                      {stop.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={stop.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="block h-full w-full bg-zinc-200" />
                      )}
                      <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                        {index + 1}
                      </span>
                    </div>
                    <span className="mt-1 block truncate text-center text-[11px] font-semibold text-zinc-900 lg:mt-0 lg:flex-1 lg:text-left lg:text-sm">
                      {stop.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeStop(stop.id)}
                      className="absolute right-0.5 top-0.5 rounded-full bg-white/90 p-0.5 text-zinc-500 lg:static lg:p-1.5 lg:bg-transparent"
                    >
                      <X className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="min-h-0 lg:flex-1 lg:overflow-y-auto lg:pb-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                {stops.length === 0 ? "Start with a pickup" : "Add another stop"}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0">
                {available.map((stop) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => addStop(stop)}
                    className="w-[8.75rem] shrink-0 rounded-2xl border border-zinc-100 bg-white p-2 text-left hover:border-zinc-300 hover:shadow-sm lg:flex lg:w-auto lg:items-center lg:gap-3 lg:pr-3"
                  >
                    {stop.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={stop.image} alt="" className="h-20 w-full rounded-xl object-cover lg:h-14 lg:w-14 lg:shrink-0" />
                    ) : (
                      <span className="block h-20 w-full rounded-xl bg-zinc-200 lg:h-14 lg:w-14 lg:shrink-0" />
                    )}
                    <span className="mt-1.5 min-w-0 block lg:mt-0">
                      <span className="block truncate text-sm font-semibold text-zinc-900">{stop.name}</span>
                      {stop.blurb ? (
                        <span className="mt-0.5 block truncate text-[11px] leading-tight text-zinc-500 lg:text-xs">{stop.blurb}</span>
                      ) : null}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="min-w-0 pt-1 lg:order-1 lg:h-full lg:overflow-y-auto lg:pt-0">
            {renderBook()}
          </aside>
        </div>
      </div>
    </div>
  )
}

function currentGuide(stops: RouteStop[], vehicle: VehicleType, withGuide: boolean) {
  if (stops.length < 2) return 0
  return guidePriceUsd(routeDistanceKm(stops), vehicle, withGuide)
}
