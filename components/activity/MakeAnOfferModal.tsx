"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { SignInButton, useUser } from "@clerk/nextjs"
import { CalendarDays, CheckCircle2, Loader2 } from "lucide-react"
import { SheetGreetingHeader } from "@/components/activity/SheetGreetingHeader"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker, DateRange } from "react-day-picker"
import { addDays, format, isBefore, parse, startOfToday } from "date-fns"
import { formatDateRangeWithDays, inclusiveDays } from "@/lib/date-range-label"
import { chargesByGuest, formatStayMoney, stayListTotal, stayRateSuffix } from "@/lib/stay-price"
import "react-day-picker/dist/style.css"
import { createOffer } from "@/app/actions/offers"
import { suggestedOfferAmount } from "@/lib/suggested-offer"
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
  activityId: string
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
  const isMulti =
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
  const [specialNotes, setSpecialNotes] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const stayDays =
    isMulti && dateRange?.from
      ? inclusiveDays(dateRange.from, dateRange.to || dateRange.from)
      : 1
  const rateSuffix = stayRateSuffix(pricingModel, categoryType, bookingType)
  const suggested = suggestedOfferAmount(listPrice)
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
    if (isSignedIn && user) {
      setGuestName(user.fullName || user.firstName || "")
      setGuestEmail(user.primaryEmailAddress?.emailAddress || "")
    }
  }, [open, isSignedIn, user, minGuests, selectedDate, selectedRange])

  useEffect(() => {
    if (!open || offerDirty) return
    setOfferAmount(suggested > 0 ? String(suggested) : "")
  }, [open, offerDirty, suggested])

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
  const offerStep = listPrice >= 50 ? 5 : 1
  const lowOffer = Math.max(1, Math.floor((listPrice * 0.8) / offerStep) * offerStep)
  const listedOffer = Math.round(listPrice)
  const offerChips = [
    { label: `$${lowOffer}`, value: String(lowOffer) },
    { label: `$${suggested}`, value: String(suggested) },
    { label: `$${listedOffer} listed`, value: String(listedOffer) },
  ].filter((chip, i, all) => Number(chip.value) > 0 && all.findIndex((item) => item.value === chip.value) === i)

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
      <div className="flex flex-col fixed inset-x-0 bottom-0 z-[99999] max-h-[90dvh] bg-white overflow-hidden rounded-t-xl sm:w-full sm:max-w-lg sm:top-1/2 sm:-translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto sm:rounded-2xl shadow-2xl">
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

              <div className="rounded-2xl border-2 border-[#FFC72C] bg-[#FFF8E1] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">Your offer</p>
                <p className="mt-0.5 text-xs text-zinc-600">
                  Enter any amount{rateSuffix !== "total" ? ` ${rateSuffix}` : ""}. The listed price is only a starting point.
                </p>
                <div className="relative mt-3">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-zinc-400">$</span>
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
                    placeholder={suggested > 0 ? String(suggested) : "0"}
                    className="w-full h-16 pl-10 pr-4 rounded-2xl border-2 border-[#FFC72C] bg-white text-3xl font-bold text-zinc-900 outline-none focus:ring-4 focus:ring-[#FFC72C]/30"
                  />
                </div>
                {listPrice > 0 && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Listed {formatStayMoney(listPrice)}
                    {rateSuffix !== "total" ? ` ${rateSuffix}` : ""}
                    {Number.isFinite(offerUnit) && offerUnit > 0 && offerUnit < listPrice
                      ? ` · you are ${formatStayMoney(listPrice - offerUnit)} under`
                      : Number.isFinite(offerUnit) && offerUnit > listPrice
                        ? ` · ${formatStayMoney(offerUnit - listPrice)} above listed`
                        : ""}
                  </p>
                )}
                {listPrice > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {offerChips.map((chip) => (
                      <button
                        key={chip.value}
                        type="button"
                        onClick={() => {
                          setOfferDirty(true)
                          setOfferAmount(chip.value)
                        }}
                        className={`rounded-full px-3 h-8 text-xs font-bold border ${
                          offerAmount === chip.value
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-700 border-zinc-200"
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
                {offerTotal > 0 && (
                  <div className="mt-3 flex items-baseline justify-between border-t border-amber-200/80 pt-3">
                    <span className="text-xs font-medium text-zinc-500">
                      {chargesByGuest(pricingModel) ? `${guestCount} ${guestCount === 1 ? "guest" : "guests"}` : "Stay"}
                      {stayDays > 1 ? ` × ${stayDays} days` : ""}
                    </span>
                    <span className="text-base font-bold text-zinc-900">
                      {formatStayMoney(offerTotal)}
                      <span className="ml-1 text-xs font-medium text-zinc-500">total</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <CalendarDays className="w-3.5 h-3.5 text-rose-500" />
                  Travel Date
                </label>
                <div className="hidden md:flex w-full h-10 px-4 rounded-xl border border-zinc-200 bg-zinc-50 items-center justify-between cursor-not-allowed">
                  <span className="font-medium text-sm text-zinc-900">{dateLabelFull}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="md:hidden">
                  <Popover.Root>
                    <Popover.Trigger asChild>
                      <button
                        type="button"
                        className="w-full h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900 bg-white flex items-center justify-between"
                      >
                        {isMulti
                          ? (dateRange?.from && dateRange?.to ? formatDateRangeWithDays(dateRange.from, dateRange.to, "MMM d") : <span className="text-zinc-400">Select dates</span>)
                          : (date ? format(parse(date, "yyyy-MM-dd", new Date()), "PP") : <span className="text-zinc-400">Select date</span>)}
                        <CalendarDays className="w-4 h-4 text-zinc-400" />
                      </button>
                    </Popover.Trigger>
                    <Popover.Portal container={document.body}>
                      <Popover.Content
                        align="center"
                        side="bottom"
                        sideOffset={8}
                        onOpenAutoFocus={(event) => event.preventDefault()}
                        className="z-[999999] bg-white rounded-xl shadow-lg border border-zinc-200 p-3 outline-none w-[calc(100vw-2rem)] md:w-auto flex justify-center"
                      >
                        {isMulti ? (
                          <DayPicker
                            className="mx-auto w-full max-w-[300px] flex justify-center"
                            mode="range"
                            selected={dateRange}
                            onSelect={setDateRange}
                            disabled={isDateDisabled}
                            modifiersClassNames={rangePickerClassNames}
                          />
                        ) : (
                          <DayPicker
                            className="mx-auto w-full max-w-[300px] flex justify-center"
                            mode="single"
                            selected={date ? parse(date, "yyyy-MM-dd", new Date()) : undefined}
                            onSelect={(day) => setDate(day ? format(day, "yyyy-MM-dd") : "")}
                            disabled={isDateDisabled}
                            modifiersClassNames={singlePickerClassNames}
                          />
                        )}
                      </Popover.Content>
                    </Popover.Portal>
                  </Popover.Root>
                </div>
              </div>

              <div className="space-y-1">
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
