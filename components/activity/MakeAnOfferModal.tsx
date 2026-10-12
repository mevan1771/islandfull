"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { SignInButton, useUser } from "@clerk/nextjs"
import { CalendarDays, CheckCircle2, Loader2 } from "lucide-react"
import { SheetGreetingHeader } from "@/components/activity/SheetGreetingHeader"
import { DayPicker, DateRange } from "react-day-picker"
import { addDays, differenceInDays, format, isBefore, parse, startOfToday } from "date-fns"
import { formatDateRangeWithDays, inclusiveDays } from "@/lib/date-range-label"
import { chargesByGuest, formatStayMoney, stayListTotal, stayRateSuffix } from "@/lib/stay-price"
import "react-day-picker/dist/style.css"
import { createOffer } from "@/app/actions/offers"
const fieldClass =
  "w-full h-10 px-4 rounded-xl border border-zinc-200 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-medium text-sm text-zinc-900"
const labelClass = "text-xs font-bold text-zinc-800 uppercase tracking-wide"
const rangePickerClassNames = {
  selected: "bg-rose-500 text-white font-bold hover:bg-rose-600",
  today: "text-rose-500 font-bold",
  range_start: "bg-rose-500 text-white font-bold rounded-l-md rounded-r-none",
  range_end: "bg-rose-500 text-white font-bold rounded-r-md rounded-l-none",
  range_middle: "bg-rose-100 text-rose-900 rounded-none hover:bg-rose-200",
}
const singlePickerClassNames = {
  selected: "bg-rose-500 text-white font-bold hover:bg-rose-600",
  today: "text-rose-500 font-bold",
}

export function MakeAnOfferModal({
  open,
  onClose,
  activityId,
  hotelId,
  title,
  listPrice,
  minGuests = 1,
  maxGuests = 20,
  bookingType = "single_day",
  pricingModel = "per_person",
  categoryType,
  minNoticeDays = 1,
  blackoutDates = [],
  selectedDate = "",
  selectedRange,
}: {
  open: boolean
  onClose: () => void
  activityId?: string
  hotelId?: string
  title: string
  listPrice: number
  minGuests?: number
  maxGuests?: number
  bookingType?: "single_day" | "multi_day" | "point_to_point" | string
  pricingModel?: string
  categoryType?: string
  minNoticeDays?: number
  blackoutDates?: string[]
  selectedDate?: string
  selectedRange?: DateRange
}) {
  const { user, isSignedIn } = useUser()
  const isHotel = !!hotelId || categoryType === "hotel" || pricingModel === "per_night"
  const isMulti =
    isHotel ||
    bookingType === "multi_day" ||
    pricingModel === "per_day" ||
    (categoryType === "transport" && bookingType !== "point_to_point")
  const [mounted, setMounted] = useState(false)
  const [guestName, setGuestName] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [guestPhone, setGuestPhone] = useState("")
  const [date, setDate] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [guestCount, setGuestCount] = useState(minGuests)
  const [offerAmount, setOfferAmount] = useState("")
  const [offerDirty, setOfferDirty] = useState(false)
  const [calOpen, setCalOpen] = useState(false)
  const [specialNotes, setSpecialNotes] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const stayDays =
    isMulti && dateRange?.from
      ? isHotel
        ? Math.max(1, differenceInDays(dateRange.to || dateRange.from, dateRange.from) || 1)
        : inclusiveDays(dateRange.from, dateRange.to || dateRange.from)
      : 1
  const rateSuffix = stayRateSuffix(pricingModel, categoryType, bookingType)
  const listedAmount = listPrice > 0 ? String(Math.round(listPrice)) : ""
  const offerStep = listPrice >= 50 ? 5 : 1
  const bumpOffer = (direction: -1 | 1) => {
    setOfferDirty(true)
    const current = Number(offerAmount)
    const base = Number.isFinite(current) && current > 0 ? current : Number(listedAmount) || offerStep
    setOfferAmount(String(Math.max(1, base + direction * offerStep)))
  }
  const offerUnit = Number(offerAmount)
  const offerTotal = stayListTotal({
    unitPrice: Number.isFinite(offerUnit) ? offerUnit : 0,
    guests: guestCount,
    days: stayDays,
    pricingModel,
    categoryType,
    bookingType,
  })

  const isDateDisabled = (day: Date) => {
    const minDate = addDays(startOfToday(), minNoticeDays > 0 ? minNoticeDays + 1 : 0)
    if (isBefore(day, minDate)) return true
    return blackoutDates.includes(format(day, "yyyy-MM-dd"))
  }

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    setError(null)
    setSent(false)
    setDate(selectedDate || "")
    setDateRange(selectedRange)
    setGuestCount(minGuests)
    setOfferDirty(false)
    setCalOpen(false)
    if (isSignedIn && user) {
      setGuestName(user.fullName || user.firstName || "")
      setGuestEmail(user.primaryEmailAddress?.emailAddress || "")
    }
  }, [open, isSignedIn, user, minGuests, selectedDate, selectedRange])

  useEffect(() => {
    if (!open || offerDirty) return
    setOfferAmount(listedAmount)
  }, [open, offerDirty, listedAmount])

  if (!mounted || !open) return null

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || ""
  const signedName = user?.fullName || firstName || "you"
  const signedEmail = user?.primaryEmailAddress?.emailAddress || ""
  const travelStart = isMulti
    ? (dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "")
    : date
  const travelEnd = isMulti
    ? (dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "")
    : undefined
  const dateLabelFull = isMulti
    ? (dateRange?.from && dateRange?.to
      ? formatDateRangeWithDays(dateRange.from, dateRange.to, "PP")
      : dateRange?.from
        ? format(dateRange.from, "PP")
        : "No dates selected")
    : (date ? format(new Date(`${date}T12:00:00`), "PP") : "No date selected")

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!travelStart) {
      setError("Please pick your travel dates.")
      return
    }
    if (!Number.isFinite(offerUnit) || offerUnit <= 0 || offerTotal <= 0) {
      setError("Enter the price you want to offer.")
      return
    }
    setIsSending(true)
    setError(null)
    const result = await createOffer({
      activityId,
      hotelId,
      guestName: isSignedIn ? signedName : guestName,
      guestEmail: isSignedIn ? signedEmail : guestEmail,
      guestPhone,
      offerAmount: offerTotal,
      travelDate: travelStart,
      travelEndDate: travelEnd,
      guestCount,
      specialNotes,
    })
    setIsSending(false)
    if (!result.success) {
      setError(result.error || "Could not send your offer.")
      return
    }
    setSent(true)
  }

  return createPortal(
    <>
      <div
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[99999]"
        onClick={onClose}
      />
      <div className="flex flex-col fixed inset-x-0 bottom-0 z-[99999] max-h-[90dvh] bg-white overflow-hidden rounded-t-xl md:w-full md:max-w-lg md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:rounded-2xl shadow-2xl">
        <SheetGreetingHeader
          title="Make an offer"
          subtitle={title}
          onClose={onClose}
          firstName={isSignedIn ? firstName || "there" : null}
          imageUrl={user?.imageUrl}
        />

        {sent ? (
          <div className="p-4 space-y-3">
            <p className="text-lg font-bold text-zinc-900">Offer sent</p>
            <p className="text-sm text-zinc-500">We’ll email you when the host responds. No payment yet.</p>
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-zinc-900 text-white font-bold"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {isSignedIn ? null : (
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className={labelClass}>Full name</span>
                    <input
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className={fieldClass}
                    />
                  </label>
                  <label className="space-y-1">
                    <span className={labelClass}>Email</span>
                    <input
                      required
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className={fieldClass}
                    />
                  </label>
                </div>
              )}

              <div className="space-y-1">
                <span className={labelClass}>Your offer</span>
                {listPrice > 0 && (
                  <p className="text-sm font-medium text-zinc-700">
                    Listed {formatStayMoney(listPrice)}{rateSuffix !== "total" ? ` ${rateSuffix}` : ""}
                  </p>
                )}
                <div className="flex items-center gap-2 w-fit p-1 rounded-xl border border-zinc-200 bg-zinc-50">
                  <button
                    type="button"
                    onClick={() => bumpOffer(-1)}
                    className="w-10 h-10 rounded-lg bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-lg font-medium text-zinc-900 active:scale-95 transition-all disabled:opacity-50"
                    disabled={Number(offerAmount) <= 1}
                  >
                    -
                  </button>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-base font-semibold text-zinc-900">$</span>
                    <input
                      required
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      value={offerAmount}
                      onChange={(e) => {
                        setOfferDirty(true)
                        setOfferAmount(e.target.value.replace(/[^\d.]/g, ""))
                      }}
                      placeholder={listedAmount || "0"}
                      className="w-[5.5rem] h-10 pl-6 pr-2 rounded-lg border-0 bg-transparent text-center text-xl font-bold text-zinc-900 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => bumpOffer(1)}
                    className="w-10 h-10 rounded-lg bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-lg font-medium text-zinc-900 active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] gap-3 items-end">
                  <div className="space-y-1 min-w-0">
                    <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                      <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
                      Date
                    </label>
                    <div className="hidden md:flex w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50 items-center justify-between cursor-not-allowed">
                      <span className="font-medium text-sm text-zinc-900 truncate">{dateLabelFull}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setCalOpen((openCal) => !openCal)}
                      className="md:hidden w-full h-10 px-3 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900 bg-white flex items-center justify-between gap-2"
                    >
                      <span className="truncate">
                        {isMulti
                          ? (dateRange?.from && dateRange?.to ? formatDateRangeWithDays(dateRange.from, dateRange.to, "MMM d") : <span className="text-zinc-400">Select</span>)
                          : (date ? format(parse(date, "yyyy-MM-dd", new Date()), "MMM d") : <span className="text-zinc-400">Select</span>)}
                      </span>
                      <CalendarDays className="w-4 h-4 text-zinc-400 shrink-0" />
                    </button>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <span className={labelClass}>Guests</span>
                    <div className="flex items-center gap-2 p-1 bg-zinc-50 rounded-xl border border-zinc-200 w-full h-10">
                      <button
                        type="button"
                        onClick={() => setGuestCount((count) => Math.max(minGuests, count - 1))}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-900 font-medium active:scale-95 transition-all disabled:opacity-50"
                        disabled={guestCount <= minGuests}
                      >
                        -
                      </button>
                      <span className="flex-1 text-center font-bold text-base">{guestCount}</span>
                      <button
                        type="button"
                        onClick={() => setGuestCount((count) => Math.min(maxGuests, count + 1))}
                        className="w-8 h-8 rounded-lg bg-white shadow-sm border border-zinc-100 flex items-center justify-center text-zinc-900 font-medium active:scale-95 transition-all disabled:opacity-50"
                        disabled={guestCount >= maxGuests}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                {calOpen && (
                  <div className="md:hidden absolute left-0 right-0 z-30 mt-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg flex justify-center">
                    {isMulti ? (
                      <DayPicker
                        className="mx-auto w-full max-w-[300px] flex justify-center"
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range)
                          if (range?.from && range?.to) setCalOpen(false)
                        }}
                        disabled={isDateDisabled}
                        modifiersClassNames={rangePickerClassNames}
                      />
                    ) : (
                      <DayPicker
                        className="mx-auto w-full max-w-[300px] flex justify-center"
                        mode="single"
                        selected={date ? parse(date, "yyyy-MM-dd", new Date()) : undefined}
                        onSelect={(day) => {
                          setDate(day ? format(day, "yyyy-MM-dd") : "")
                          if (day) setCalOpen(false)
                        }}
                        disabled={isDateDisabled}
                        modifiersClassNames={singlePickerClassNames}
                      />
                    )}
                  </div>
                )}
              </div>

              {offerTotal > 0 && (
                <div className="flex items-baseline justify-between px-0.5">
                  <span className="text-xs font-medium text-zinc-500">
                    {chargesByGuest(pricingModel) ? `${guestCount} ${guestCount === 1 ? "guest" : "guests"}` : "Stay"}
                    {stayDays > 1 ? ` × ${stayDays} days` : ""}
                  </span>
                  <span className="text-base font-bold text-zinc-900">
                    {formatStayMoney(offerTotal)}
                    <span className="ml-1 text-xs font-medium text-zinc-400">total</span>
                  </span>
                </div>
              )}

              <label className="block space-y-1">
                <span className={labelClass}>Phone <span className="font-medium normal-case tracking-normal text-zinc-400">(optional)</span></span>
                <input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className={fieldClass}
                />
              </label>

              <label className="block space-y-1">
                <span className={labelClass}>Special requests <span className="font-medium normal-case tracking-normal text-zinc-400">(optional)</span></span>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  rows={2}
                  className="w-full h-auto p-3 rounded-xl border border-zinc-200 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-medium text-sm text-zinc-900 resize-none"
                />
              </label>

              {error && <p className="text-sm font-medium text-rose-600">{error}</p>}
            </div>

            <div className="shrink-0 p-4 border-t border-gray-100 bg-white flex flex-col gap-2">
              {!isSignedIn && (
                <p className="text-center text-sm text-zinc-500">
                  Have an account?{" "}
                  <SignInButton mode="modal" forceRedirectUrl={typeof window === "undefined" ? "/" : window.location.href}>
                    <button type="button" className="font-bold text-zinc-900 hover:underline underline-offset-2">
                      Sign in
                    </button>
                  </SignInButton>
                </p>
              )}
              <button
                type="submit"
                disabled={isSending}
                className="w-full h-11 rounded-xl bg-[#FFC72C] hover:bg-[#f0b820] text-zinc-900 font-bold disabled:opacity-60 flex items-center justify-center gap-2 shadow-xl shadow-[#FFC72C]/30"
              >
                {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSending ? "Sending..." : "Send Offer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>,
    document.body
  )
}
