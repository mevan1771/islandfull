"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { SignInButton, useUser } from "@clerk/nextjs"
import { CalendarDays, CheckCircle2, Loader2, X } from "lucide-react"
import { DayPicker, DateRange } from "react-day-picker"
import { addDays, format, isBefore, startOfToday } from "date-fns"
import "react-day-picker/dist/style.css"
import { createOffer } from "@/app/actions/offers"
import { suggestedOfferAmount } from "@/lib/suggested-offer"
import { formatUSD } from "@/lib/utils"

const fieldClass =
  "w-full h-10 px-4 rounded-xl border border-zinc-200 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-medium text-sm text-zinc-900"
const labelClass = "text-xs font-bold text-zinc-800 uppercase tracking-wide"
const dayPickerClassNames = {
  selected: "bg-rose-500 text-white font-bold hover:bg-rose-600",
  today: "text-rose-500 font-bold",
  range_start: "bg-rose-500 text-white font-bold rounded-l-md rounded-r-none",
  range_end: "bg-rose-500 text-white font-bold rounded-r-md rounded-l-none",
  range_middle: "bg-rose-100 text-rose-900 rounded-none hover:bg-rose-200",
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
  const [calOpen, setCalOpen] = useState(false)
  const [guestCount, setGuestCount] = useState(minGuests)
  const [offerAmount, setOfferAmount] = useState("")
  const [specialNotes, setSpecialNotes] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const suggested = suggestedOfferAmount(listPrice)

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
    setCalOpen(false)
    setDate(selectedDate || "")
    setDateRange(selectedRange)
    setGuestCount(minGuests)
    setOfferAmount(suggested > 0 ? String(suggested) : "")
    if (isSignedIn && user) {
      setGuestName(user.fullName || user.firstName || "")
      setGuestEmail(user.primaryEmailAddress?.emailAddress || "")
    }
  }, [open, isSignedIn, user, minGuests, suggested, selectedDate, selectedRange])

  if (!mounted || !open) return null

  const signedName = user?.fullName || user?.firstName || "you"
  const signedEmail = user?.primaryEmailAddress?.emailAddress || ""
  const travelStart = isMulti
    ? (dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "")
    : date
  const travelEnd = isMulti
    ? (dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "")
    : undefined
  const dateLabelShort = isMulti
    ? (dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d")}`
      : dateRange?.from
        ? format(dateRange.from, "MMM d")
        : null)
    : (date ? format(new Date(`${date}T12:00:00`), "PP") : null)
  const dateLabelFull = isMulti
    ? (dateRange?.from && dateRange?.to
      ? `${format(dateRange.from, "PP")} - ${format(dateRange.to, "PP")}`
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
    setIsSending(true)
    setError(null)
    const result = await createOffer({
      activityId,
      guestName: isSignedIn ? signedName : guestName,
      guestEmail: isSignedIn ? signedEmail : guestEmail,
      guestPhone,
      offerAmount: Number(offerAmount),
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
    <div
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-xl shadow-2xl flex flex-col overflow-hidden max-h-[90dvh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 p-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Make an offer</h2>
            <p className="text-sm text-zinc-500 line-clamp-1">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-zinc-500"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
            <div className="relative min-h-[340px] flex-1">
              <div className="p-4 space-y-2 overflow-y-auto h-full">
              {listPrice > 0 && (
                <p className="text-xs font-medium text-zinc-400">
                  Listed from {formatUSD(listPrice)}
                  {suggested > 0 && suggested < listPrice ? ` · starting at ${formatUSD(suggested)}` : ""}
                </p>
              )}

              {isSignedIn ? (
                <p className="text-xs text-zinc-400">
                  Offering as <span className="font-medium text-zinc-600">{signedName}</span>
                  {signedEmail ? ` · ${signedEmail}` : ""}
                </p>
              ) : (
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
                <span className={labelClass}>{isMulti ? "Travel dates" : "Travel date"}</span>
                <div className="hidden md:flex w-full h-10 px-4 rounded-xl border border-zinc-200 bg-zinc-50 items-center justify-between">
                  <span className="font-medium text-sm text-zinc-900">{dateLabelFull}</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <button
                  type="button"
                  onClick={() => setCalOpen((open) => !open)}
                  className={`${fieldClass} md:hidden flex items-center justify-between text-left`}
                >
                  {dateLabelShort || <span className="text-zinc-400 font-medium">{isMulti ? "Select dates" : "Select date"}</span>}
                  <CalendarDays className="w-4 h-4 text-zinc-400 shrink-0" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className={labelClass}>Guests</span>
                  <input
                    required
                    type="number"
                    min={minGuests}
                    max={maxGuests}
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className={fieldClass}
                  />
                </label>
                <label className="space-y-1">
                  <span className={labelClass}>Your offer (USD)</span>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">$</span>
                    <input
                      required
                      type="number"
                      min="1"
                      step="1"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className={`${fieldClass} pl-8 font-bold`}
                    />
                  </div>
                </label>
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

              {calOpen && (
                <div className="absolute inset-0 z-20 bg-white px-3 pt-3 pb-2 flex flex-col">
                  <button
                    type="button"
                    onClick={() => setCalOpen(false)}
                    className={`${fieldClass} flex items-center justify-between text-left shrink-0 mb-2`}
                  >
                    {dateLabelShort || <span className="text-zinc-400 font-medium">{isMulti ? "Select dates" : "Select date"}</span>}
                    <CalendarDays className="w-4 h-4 text-zinc-400 shrink-0" />
                  </button>
                  <div className="flex-1 min-h-0 flex items-start justify-center overflow-hidden">
                    {isMulti ? (
                      <DayPicker
                        className="mx-auto"
                        mode="range"
                        selected={dateRange}
                        onSelect={(range) => {
                          setDateRange(range)
                          if (range?.from && range?.to) setCalOpen(false)
                        }}
                        disabled={isDateDisabled}
                        modifiersClassNames={dayPickerClassNames}
                      />
                    ) : (
                      <DayPicker
                        className="mx-auto"
                        mode="single"
                        selected={date ? new Date(`${date}T12:00:00`) : undefined}
                        onSelect={(day) => {
                          setDate(day ? format(day, "yyyy-MM-dd") : "")
                          if (day) setCalOpen(false)
                        }}
                        disabled={isDateDisabled}
                        modifiersClassNames={dayPickerClassNames}
                      />
                    )}
                  </div>
                </div>
              )}
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
                className="w-full h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold disabled:opacity-60 flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20"
              >
                {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSending ? "Sending..." : "Send Offer"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  )
}
