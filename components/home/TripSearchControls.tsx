"use client"

import { useEffect, useState } from "react"
import { CalendarDays, Minus, Plus, Users, X } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { DayPicker } from "react-day-picker"
import { format, isBefore, parse, startOfToday } from "date-fns"
import "react-day-picker/dist/style.css"
import { ensureTripSearchHydrated, useTripSearchStore } from "@/store/useTripSearchStore"
import { formatGuestsLabel, formatTripDateLabel, TRIP_GUESTS_MAX } from "@/lib/trip-search"

const dayPickerClass = "mx-auto w-full max-w-[300px] flex justify-center text-sm"

function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] sm:hidden">
      <button type="button" className="absolute inset-0 bg-zinc-900/45" aria-label="Close" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-zinc-900">{title}</p>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-xl bg-rose-500 text-sm font-bold text-white"
        >
          Done
        </button>
      </div>
    </div>
  )
}

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

function GuestsBody({
  guests,
  onChange,
}: {
  guests: number
  onChange: (next: number) => void
}) {
  const value = guests || 1
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div>
        <p className="text-sm font-bold text-zinc-900">Guests</p>
        <p className="text-xs text-zinc-500">How many people on this tour</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 disabled:opacity-30"
          disabled={value <= 1}
          onClick={() => onChange(value - 1)}
          aria-label="Fewer guests"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-6 text-center text-base font-bold tabular-nums">{value}</span>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 disabled:opacity-30"
          disabled={value >= TRIP_GUESTS_MAX}
          onClick={() => onChange(value + 1)}
          aria-label="More guests"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function DateSearchField({ compact = false }: { compact?: boolean }) {
  const date = useTripSearchStore((s) => s.date)
  const setDate = useTripSearchStore((s) => s.setDate)
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState(false)

  useEffect(() => {
    ensureTripSearchHydrated()
  }, [])

  const label = formatTripDateLabel(date, compact ? "Dates" : "Add dates")
  const triggerClass = compact
    ? "flex min-w-0 items-center gap-1.5 text-left text-xs font-semibold text-zinc-800"
    : "flex w-full flex-col justify-center text-left"

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className={triggerClass}
            onPointerDown={(event) => {
              if (window.matchMedia("(max-width: 639px)").matches) {
                event.preventDefault()
                setOpen(false)
                setSheet(true)
              }
            }}
          >
            {compact ? (
              <>
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className={`truncate ${date ? "text-zinc-900" : "text-zinc-400"}`}>{label}</span>
              </>
            ) : (
              <>
                <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-wider text-gray-800 md:text-xs">Date</span>
                <span className={`truncate text-sm ${date ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
              </>
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={10}
            className="z-[80] rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl outline-none max-sm:hidden"
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
      <Sheet open={sheet} title="When are you going?" onClose={() => setSheet(false)}>
        <DatePickerBody date={date} onPick={setDate} />
        {date ? (
          <button type="button" className="mt-2 text-xs font-semibold text-zinc-500" onClick={() => setDate("")}>
            Clear date
          </button>
        ) : null}
      </Sheet>
    </>
  )
}

export function GuestsSearchField({ compact = false }: { compact?: boolean }) {
  const guests = useTripSearchStore((s) => s.guests)
  const setGuests = useTripSearchStore((s) => s.setGuests)
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState(false)

  useEffect(() => {
    ensureTripSearchHydrated()
  }, [])

  const label = formatGuestsLabel(guests, compact ? "Guests" : "Add guests")
  const triggerClass = compact
    ? "flex min-w-0 items-center gap-1.5 text-left text-xs font-semibold text-zinc-800"
    : "flex w-full flex-col justify-center text-left"

  return (
    <>
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next && !guests) setGuests(1)
        }}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            className={triggerClass}
            onPointerDown={(event) => {
              if (window.matchMedia("(max-width: 639px)").matches) {
                event.preventDefault()
                setOpen(false)
                setSheet(true)
                if (!guests) setGuests(1)
              }
            }}
          >
            {compact ? (
              <>
                <Users className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <span className={`truncate ${guests ? "text-zinc-900" : "text-zinc-400"}`}>{label}</span>
              </>
            ) : (
              <>
                <span className="mb-0.5 block text-[10px] font-extrabold uppercase tracking-wider text-gray-800 md:text-xs">Travelers</span>
                <span className={`truncate text-sm ${guests ? "text-gray-800" : "text-gray-400"}`}>{label}</span>
              </>
            )}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={10}
            className="z-[80] w-80 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl outline-none max-sm:hidden"
          >
            <GuestsBody guests={guests} onChange={setGuests} />
            {guests ? (
              <button type="button" className="mt-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800" onClick={() => setGuests(0)}>
                Clear guests
              </button>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <Sheet open={sheet} title="Who is coming?" onClose={() => setSheet(false)}>
        <GuestsBody guests={guests} onChange={setGuests} />
        {guests ? (
          <button type="button" className="mt-2 text-xs font-semibold text-zinc-500" onClick={() => setGuests(0)}>
            Clear guests
          </button>
        ) : null}
      </Sheet>
    </>
  )
}
