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
  "w-full h-8 px-2.5 rounded-lg border border-zinc-200 outline-none focus:border-[#FFC72C] focus:ring-2 focus:ring-[#FFC72C]/30 font-medium text-sm text-zinc-900 bg-white"

const sendClass =
  "w-full h-9 rounded-lg bg-[#FFC72C] hover:bg-[#f0b820] text-zinc-900 font-bold disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-[#FFC72C]/25"

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
    <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-2 space-y-1.5">
      <div className="flex gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {VEHICLE_ORDER.map((type) => {
          const selected = vehicle === type
          const meta = VEHICLE_RATES[type]
          return (
            <button
              key={type}
              type="button"
              onClick={() => pickVehicle(type)}
              className={`flex h-11 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg px-1 ${
                selected ? "bg-[#FFF8E1] ring-2 ring-[#FFC72C]" : "hover:bg-zinc-50"
              }`}
            >
              {meta.icon ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meta.icon} alt="" className="h-10 w-10 shrink-0 object-contain" />
              ) : null}
              <span className={`hidden truncate text-[10px] lg:inline ${selected ? "font-bold text-zinc-900" : "font-medium text-zinc-500"}`}>
                {meta.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => pickGuide(false)}
          className={`h-7 rounded-md text-[11px] font-semibold ${
            !wantsGuide ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          No guide
        </button>
        <button
          type="button"
          onClick={() => pickGuide(true)}
          className={`h-7 rounded-md text-[11px] font-semibold ${
            wantsGuide ? "bg-[#FFC72C] text-zinc-900" : "bg-zinc-100 text-zinc-600"
          }`}
        >
          With guide · +${GUIDE_FEE_USD}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Popover.Root open={calOpen} onOpenChange={setCalOpen}>
          <Popover.Trigger asChild>
            <button type="button" className={`${fieldClass} min-w-[7.5rem] flex-1 text-left truncate inline-flex items-center gap-1`}>
              <CalendarDays className="w-3.5 h-3.5 shrink-0 text-rose-500" />
              {date ? format(new Date(`${date}T12:00:00`), "d MMM") : "Date"}
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

        <div className="flex h-8 shrink-0 items-center rounded-lg border border-zinc-200 px-0.5">
          <button type="button" className="w-7 h-7 rounded-md text-sm font-bold" onClick={() => setGuests((n) => Math.max(1, n - 1))}>
            −
          </button>
          <span className="w-6 text-center text-sm font-bold">{Math.min(guests, maxGuests)}</span>
          <button type="button" className="w-7 h-7 rounded-md text-sm font-bold" onClick={() => setGuests((n) => Math.min(maxGuests, n + 1))}>
            +
          </button>
        </div>

        <div className="flex h-8 min-w-0 flex-1 items-center justify-between gap-1 rounded-lg border-2 border-[#FFC72C] bg-[#FFF8E1] pl-2 pr-0.5">
          <span className="truncate text-[10px] font-black uppercase tracking-wide text-zinc-900">
            Offer{guide > 0 ? ` · $${guide}` : ""}
          </span>
          <div className="flex shrink-0 items-center rounded-md bg-white">
            <button type="button" onClick={() => bump(-1)} className="flex h-7 w-7 items-center justify-center">
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <span className="pointer-events-none absolute left-0.5 top-1/2 -translate-y-1/2 text-xs font-black">$</span>
              <input
                className="h-7 w-12 bg-transparent pl-3 pr-0.5 text-center text-sm font-black tabular-nums outline-none"
                inputMode="numeric"
                value={offerDirty ? offer : guide || ""}
                onChange={(e) => {
                  setOfferDirty(true)
                  setOffer(e.target.value.replace(/[^\d]/g, ""))
                }}
              />
            </div>
            <button type="button" onClick={() => bump(1)} className="flex h-7 w-7 items-center justify-center">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        <input className={fieldClass} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={fieldClass} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className={`${fieldClass} col-span-2 sm:col-span-1`} placeholder="WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}

      {isSignedIn ? (
        <button type="button" disabled={sending} onClick={submit} className={sendClass}>
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Offer"}
        </button>
      ) : (
        <SignInButton mode="modal">
          <button type="button" className={sendClass}>
            Sign in to send this route
          </button>
        </SignInButton>
      )}
      <p className="text-center text-[10px] leading-none text-zinc-400 pb-0.5">No payment yet. 24 hours to pay if a host accepts.</p>
    </div>
  )

  return (
    <div className="w-full min-h-screen bg-zinc-50 pb-24 lg:pb-4">
      <div className="lg:flex lg:items-start lg:max-w-[1600px] lg:mx-auto">
        <aside className="relative lg:sticky lg:top-[4.75rem] lg:self-start lg:w-[42%] lg:shrink-0 lg:h-[calc(100dvh-5.25rem)] lg:mr-6 xl:mr-8 flex flex-col gap-2 px-0 lg:px-0">
          <div className={`${stops.length >= 2 ? "h-[36svh]" : "h-[48svh]"} min-h-56 max-h-[26rem] lg:h-auto lg:max-h-none lg:flex-1 lg:min-h-0 overflow-hidden rounded-none lg:rounded-2xl bg-zinc-900 shadow-none lg:shadow-xl border-0 lg:border lg:border-zinc-800`}>
            <RouteIslandMap
              stops={stops}
              onAdd={addStop}
              onRemoveLast={removeStop}
              className="h-full min-h-56"
            />
          </div>
          <div className="hidden lg:block shrink-0 px-0">{renderBook()}</div>
        </aside>

        <section className="min-w-0 w-full lg:w-[58%] px-4 md:px-8 pb-8 pt-3 lg:pt-6 lg:pb-8 lg:h-[calc(100dvh-5rem)] lg:overflow-y-auto">
          <Link href="/?vertical=transport" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 mb-2 lg:mb-3">
            <ArrowLeft className="w-4 h-4" /> Transport
          </Link>
          <h1 className="text-xl lg:text-3xl font-black tracking-tight text-zinc-900">Plan a route</h1>
          <p className="text-zinc-500 mt-1 mb-3 lg:mb-5 text-sm md:text-base">
            Tap a yellow dot on the map or a place below. We send your price to every {VEHICLE_RATES[vehicle].label.toLowerCase()} host.
          </p>

          {stops.length > 0 ? (
            <section className="bg-white rounded-2xl border border-zinc-100 p-2 space-y-1.5 mb-4">
              {stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center gap-2.5">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                    {stop.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={stop.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-zinc-200" />
                    )}
                    <span className="absolute left-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-900 truncate">{stop.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {index === 0 ? "Pickup" : "Stop"}
                      {stop.blurb ? ` · ${stop.blurb}` : ""}
                    </p>
                  </div>
                  <button type="button" onClick={() => removeStop(stop.id)} className="p-2 text-zinc-400 hover:text-zinc-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </section>
          ) : null}

          <section className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">
              {stops.length === 0 ? "Start with a pickup" : "Add another stop"}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-2 lg:overflow-visible lg:gap-1.5 lg:pb-0">
              {available.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => addStop(stop)}
                  className="flex w-[9.5rem] shrink-0 items-center gap-2 rounded-xl border border-zinc-100 bg-white p-1 pr-2.5 text-left hover:border-zinc-300 hover:shadow-sm lg:w-auto"
                >
                  {stop.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={stop.image} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="h-11 w-11 shrink-0 rounded-lg bg-zinc-200" />
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-zinc-900">{stop.name}</span>
                    {stop.blurb ? <span className="block truncate text-[10px] leading-tight text-zinc-500">{stop.blurb}</span> : null}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {stops.length >= 2 ? (
            <div className="lg:hidden mb-6">{renderBook()}</div>
          ) : (
            <p className="lg:hidden text-center text-xs text-zinc-500 pb-6">
              Pick a pickup and one more stop, then send your offer.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}

function currentGuide(stops: RouteStop[], vehicle: VehicleType, withGuide: boolean) {
  if (stops.length < 2) return 0
  return guidePriceUsd(routeDistanceKm(stops), vehicle, withGuide)
}
