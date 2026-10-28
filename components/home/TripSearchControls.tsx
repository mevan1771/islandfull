"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { CalendarDays, Minus, Plus, Users, X } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker } from "react-day-picker"
import { format, isBefore, parse, startOfToday } from "date-fns"
import "react-day-picker/dist/style.css"
import { ensureTripSearchHydrated, useTripSearchStore } from "@/store/useTripSearchStore"
import { adultsFromTrip, formatGuestsLabel, formatTripDateLabel, formatTripDateShort, TRIP_GUESTS_MAX } from "@/lib/trip-search"

const dayPickerClass = "mx-auto w-full max-w-[300px] flex justify-center text-sm"

function DatePickerBody({
  date,
  onPick,
}: {
  date: string
  onPick: (next: string) => void
}) {
  const selected = date ? parse(date, "yyyy-MM-dd", new Date()) : undefined
  return (
    <DayPicker
      className={dayPickerClass}
      mode="single"
      weekStartsOn={1}
      selected={selected}
      onSelect={(day) => onPick(day ? format(day, "yyyy-MM-dd") : "")}
      disabled={(day) => isBefore(day, startOfToday())}
      modifiersClassNames={{
        selected: "bg-rose-500 text-white font-bold hover:bg-rose-600",
        today: "text-rose-500 font-bold",
      }}
    />
  )
}

function CountRow({
  title,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  title: string
  hint: string
  value: number
  min: number
  max: number
  onChange: (next: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-zinc-100 last:border-0">
      <div>
        <p className="text-sm font-bold text-zinc-900">{title}</p>
        <p className="text-xs text-zinc-500">{hint}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 disabled:opacity-30 touch-manipulation"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          aria-label={`Fewer ${title.toLowerCase()}`}
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-base font-bold tabular-nums">{value}</span>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 disabled:opacity-30 touch-manipulation"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          aria-label={`More ${title.toLowerCase()}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function GuestsBody() {
  const guests = useTripSearchStore((s) => s.guests)
  const children = useTripSearchStore((s) => s.children)
  const infants = useTripSearchStore((s) => s.infants)
  const setParty = useTripSearchStore((s) => s.setParty)
  const adults = Math.max(1, adultsFromTrip({ guests: guests || 1, children }))
  const childMax = Math.max(0, TRIP_GUESTS_MAX - adults)

  return (
    <div>
      <CountRow
        title="Adults"
        hint="Ages 13+"
        value={adults}
        min={1}
        max={TRIP_GUESTS_MAX - children}
        onChange={(next) => setParty({ adults: next })}
      />
      <CountRow
        title="Children"
        hint="Ages 2–12 · take a seat, billed as a guest"
        value={children}
        min={0}
        max={childMax}
        onChange={(next) => setParty({ children: next })}
      />
      <CountRow
        title="Infants"
        hint="Under 2 · sit on a lap, not billed"
        value={infants}
        min={0}
        max={8}
        onChange={(next) => setParty({ infants: next })}
      />
    </div>
  )
}

export function DateSearchField() {
  const date = useTripSearchStore((s) => s.date)
  const setDate = useTripSearchStore((s) => s.setDate)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    ensureTripSearchHydrated()
  }, [])

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="flex w-full flex-col justify-center text-left">
          <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-wider text-gray-800 md:text-xs">Date</span>
          <span className={`truncate text-sm ${date ? "text-gray-800" : "text-gray-400"}`}>
            {formatTripDateLabel(date)}
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={10}
          className="z-[80] rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl outline-none"
        >
          <DatePickerBody
            date={date}
            onPick={(next) => {
              setDate(next)
              setOpen(false)
            }}
          />
          {date ? (
            <button type="button" className="mt-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800" onClick={() => setDate("")}>
              Clear date
            </button>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function GuestsSearchField() {
  const guests = useTripSearchStore((s) => s.guests)
  const children = useTripSearchStore((s) => s.children)
  const infants = useTripSearchStore((s) => s.infants)
  const setParty = useTripSearchStore((s) => s.setParty)
  const clearParty = useTripSearchStore((s) => s.clearParty)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    ensureTripSearchHydrated()
  }, [])

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next && !guests) setParty({ adults: 1 })
      }}
    >
      <Popover.Trigger asChild>
        <button type="button" className="flex w-full flex-col justify-center text-left">
          <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-wider text-gray-800 md:text-xs">Travelers</span>
          <span className={`truncate text-sm ${guests ? "text-gray-800" : "text-gray-400"}`}>
            {formatGuestsLabel({ guests, children, infants })}
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={10}
          className="z-[80] w-80 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl outline-none"
        >
          <GuestsBody />
          {guests ? (
            <button type="button" className="mt-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800" onClick={clearParty}>
              Clear guests
            </button>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export function MobileTripChips({
  onOpenDate,
  onOpenGuests,
}: {
  onOpenDate: () => void
  onOpenGuests: () => void
}) {
  const date = useTripSearchStore((s) => s.date)
  const guests = useTripSearchStore((s) => s.guests)
  const dateLabel = formatTripDateShort(date)

  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        type="button"
        aria-label={dateLabel ? `Travel date ${dateLabel}` : "Choose date"}
        className="relative z-10 flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-full bg-zinc-100 px-2 text-[11px] font-semibold text-zinc-800 touch-manipulation"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onOpenDate()
        }}
      >
        <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
        {dateLabel ? <span className="tabular-nums">{dateLabel}</span> : null}
      </button>
      <button
        type="button"
        aria-label={guests ? `${guests} travelers` : "Choose travelers"}
        className="relative z-10 flex h-8 min-w-8 shrink-0 items-center justify-center gap-1 rounded-full bg-zinc-100 px-2 text-[11px] font-semibold text-zinc-800 touch-manipulation"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onOpenGuests()
        }}
      >
        <Users className="h-3.5 w-3.5 text-zinc-500" />
        {guests ? <span className="tabular-nums">{guests}</span> : null}
      </button>
    </div>
  )
}

export function MobileTripSheet({
  tab,
  onClose,
}: {
  tab: "date" | "guests" | null
  onClose: () => void
}) {
  const date = useTripSearchStore((s) => s.date)
  const setDate = useTripSearchStore((s) => s.setDate)
  const guests = useTripSearchStore((s) => s.guests)
  const setParty = useTripSearchStore((s) => s.setParty)
  const clearParty = useTripSearchStore((s) => s.clearParty)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!tab) return
    if (tab === "guests" && !guests) setParty({ adults: 1 })
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [tab, guests, setParty, onClose])

  if (!mounted || !tab) return null

  return createPortal(
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-zinc-900/50" aria-label="Close" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-2xl bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-zinc-900">{tab === "date" ? "When are you going?" : "Who is coming?"}</p>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {tab === "date" ? (
          <>
            <DatePickerBody date={date} onPick={setDate} />
            {date ? (
              <button type="button" className="mt-2 text-xs font-semibold text-zinc-500" onClick={() => setDate("")}>
                Clear date
              </button>
            ) : null}
          </>
        ) : (
          <>
            <GuestsBody />
            {guests ? (
              <button type="button" className="mt-2 text-xs font-semibold text-zinc-500" onClick={clearParty}>
                Clear guests
              </button>
            ) : null}
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-rose-500 text-sm font-bold text-white touch-manipulation"
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  )
}
