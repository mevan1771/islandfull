"use client"

import { useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { differenceInDays, format } from "date-fns"
import { DateRange, DayPicker } from "react-day-picker"
import { Clock } from "lucide-react"
import { formatUSD } from "@/lib/utils"
import "react-day-picker/dist/style.css"

type Room = {
  id: string
  name: string
  nightly_rate_usd?: number | null
  max_occupancy?: number | null
}

const pickerClassNames = {
  selected: "bg-rose-500 text-white font-bold hover:bg-rose-600",
  today: "text-rose-500 font-bold",
  range_start: "bg-rose-500 text-white font-bold rounded-l-md rounded-r-none",
  range_end: "bg-rose-500 text-white font-bold rounded-r-md rounded-l-none",
  range_middle: "bg-rose-100 text-rose-900 rounded-none hover:bg-rose-200",
}

export function HotelStayWidget({
  title,
  rooms,
  checkInTime,
  checkOutTime,
  whatsapp,
  hostName,
  hostAvatar,
  slot = "desktop",
}: {
  title: string
  rooms: Room[]
  checkInTime?: string | null
  checkOutTime?: string | null
  whatsapp?: string | null
  hostName?: string | null
  hostAvatar?: string | null
  slot?: "desktop" | "mobile"
}) {
  const activeRooms = rooms.filter((room) => Number(room.nightly_rate_usd) > 0)
  const [roomId, setRoomId] = useState(activeRooms[0]?.id || rooms[0]?.id || "")
  const [range, setRange] = useState<DateRange | undefined>()
  const [guests, setGuests] = useState(2)
  const [open, setOpen] = useState(false)

  const room = activeRooms.find((item) => item.id === roomId) || activeRooms[0] || rooms[0]
  const rate = Number(room?.nightly_rate_usd) || 0
  const nights =
    range?.from && range?.to ? Math.max(1, differenceInDays(range.to, range.from)) : 0
  const total = nights > 0 ? rate * nights : rate
  const maxGuests = Math.max(1, Number(room?.max_occupancy) || 8)

  const inquireHref = useMemo(() => {
    const digits = String(whatsapp || "447342573235").replace(/\D/g, "")
    const dates =
      range?.from && range?.to
        ? `${format(range.from, "d MMM yyyy")} → ${format(range.to, "d MMM yyyy")} (${nights} night${nights === 1 ? "" : "s"})`
        : "dates TBC"
    const text = `Hi IslandFull, I would like to stay at ${title}. Room: ${room?.name || "any"}. Guests: ${guests}. ${dates}.`
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`
  }, [guests, nights, range, room?.name, title, whatsapp])

  const form = (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">From</p>
          <p className="text-3xl font-bold text-zinc-900 leading-none">
            {rate ? formatUSD(rate) : "—"}
            <span className="ml-1 text-sm font-medium text-zinc-500">/ night</span>
          </p>
        </div>
        {(checkInTime || checkOutTime) && (
          <p className="text-xs font-medium text-zinc-500 inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            In {checkInTime || "14:00"} · Out {checkOutTime || "11:00"}
          </p>
        )}
      </div>

      {rooms.length > 0 && (
        <label className="block space-y-1">
          <span className="text-xs font-bold uppercase tracking-wide text-zinc-800">Room</span>
          <select
            value={room?.id || ""}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-zinc-200 bg-white text-sm font-medium"
          >
            {(activeRooms.length ? activeRooms : rooms).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} · {formatUSD(Number(item.nightly_rate_usd) || 0)} / night
              </option>
            ))}
          </select>
        </label>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-800 mb-2">Stay dates</p>
        <DayPicker
          className="mx-auto w-full max-w-[300px] flex justify-center"
          mode="range"
          selected={range}
          onSelect={setRange}
          disabled={{ before: new Date() }}
          modifiersClassNames={pickerClassNames}
        />
      </div>

      <div className="space-y-1">
        <span className="text-xs font-bold uppercase tracking-wide text-zinc-800">Guests</span>
        <div className="flex items-center gap-2 p-1 bg-zinc-50 rounded-xl border border-zinc-200 w-fit h-10">
          <button
            type="button"
            onClick={() => setGuests((n) => Math.max(1, n - 1))}
            className="w-8 h-8 rounded-lg bg-white border border-zinc-100 font-medium active:scale-95 disabled:opacity-50"
            disabled={guests <= 1}
          >
            -
          </button>
          <span className="w-8 text-center font-bold">{guests}</span>
          <button
            type="button"
            onClick={() => setGuests((n) => Math.min(maxGuests, n + 1))}
            className="w-8 h-8 rounded-lg bg-white border border-zinc-100 font-medium active:scale-95 disabled:opacity-50"
            disabled={guests >= maxGuests}
          >
            +
          </button>
        </div>
      </div>

      {nights > 0 && (
        <div className="flex items-baseline justify-between border-t border-zinc-100 pt-3">
          <span className="text-sm text-zinc-500">
            {formatUSD(rate)} × {nights} night{nights === 1 ? "" : "s"}
          </span>
          <span className="text-lg font-bold">{formatUSD(total)}</span>
        </div>
      )}

      <a
        href={inquireHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 items-center justify-center rounded-xl bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/25 active:scale-[0.98]"
      >
        Reserve now
      </a>
      <p className="text-center text-xs text-zinc-400">We’ll confirm dates with the host. No card charged yet.</p>
    </div>
  )

  if (slot === "desktop") {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl">
        {form}
        <a
          href={`https://wa.me/${String(whatsapp || "447342573235").replace(/\D/g, "")}?text=${encodeURIComponent(`Hi IslandFull, I have a question about ${title}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 hidden md:flex items-center justify-center gap-2.5 h-12 text-sm font-semibold text-zinc-700"
        >
          <span className="relative">
            {hostAvatar ? (
              <img src={hostAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <span className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-500">
                {(hostName || "H").charAt(0)}
              </span>
            )}
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white" />
          </span>
          Chat now
        </a>
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-zinc-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-40">
        <div className="max-w-md mx-auto flex items-center gap-2.5">
          <div className="flex flex-col min-w-0">
            <span className="text-xl font-bold text-zinc-900 leading-none">{rate ? formatUSD(rate) : "—"}</span>
            <span className="text-[11px] font-medium text-zinc-500">/ night</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex-1 h-12 rounded-xl bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-500/25 active:scale-[0.98] cursor-pointer touch-manipulation"
          >
            Reserve now
          </button>
        </div>
      </div>
      {open &&
        createPortal(
          <>
            <div className="fixed inset-0 bg-zinc-900/60 z-[99999]" onClick={() => setOpen(false)} />
            <div className="fixed inset-x-0 bottom-0 z-[99999] max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-zinc-900">Complete reservation</p>
                <button type="button" onClick={() => setOpen(false)} className="text-sm font-semibold text-zinc-500">
                  Close
                </button>
              </div>
              {form}
            </div>
          </>,
          document.body
        )}
    </>
  )
}
