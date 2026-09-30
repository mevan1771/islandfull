"use client"

import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import type { Destination } from "@/lib/destinations"
import { getNearbyDestinations } from "@/lib/destinations"

type DestinationBranchProps = {
  hub: Destination
  trail: Destination[]
  counts: Record<string, number>
  onClose: () => void
  onBranchTo: (dest: Destination) => void
  onJumpTo: (dest: Destination) => void
  onOpenMap: (dest: Destination) => void
}

function polar(index: number, total: number, radius: number) {
  const start = -Math.PI / 2
  const angle = start + (index * (2 * Math.PI)) / Math.max(total, 1)
  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
  }
}

function branchPath(x: number, y: number) {
  const mx = (50 + x) / 2
  const my = (50 + y) / 2
  const dx = x - 50
  const dy = y - 50
  return `M 50 50 Q ${mx - dy * 0.12} ${my + dx * 0.12} ${x} ${y}`
}

export function DestinationBranch({
  hub,
  trail,
  counts,
  onClose,
  onBranchTo,
  onJumpTo,
  onOpenMap,
}: DestinationBranchProps) {
  const nearby = getNearbyDestinations(hub.name)
  const gradientId = `branch-${useId().replace(/:/g, "")}`
  const hubCount = counts[hub.name] ?? 0
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-x-0 top-16 bottom-0 z-40 flex flex-col bg-zinc-950/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3 px-4 pt-3 pb-1">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold">Nearby from</p>
          <h2 className="text-xl font-bold text-white truncate">{hub.name}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-full bg-white/10 text-white text-sm font-semibold px-3 py-1.5 hover:bg-white/20"
        >
          Close
        </button>
      </div>

      {trail.length > 1 && (
        <nav className="px-4 pb-1 flex items-center gap-1 overflow-x-auto text-xs text-white/70 no-scrollbar" aria-label="Places you branched through">
          {trail.map((stop, index) => (
            <span key={`${stop.id}-${index}`} className="flex items-center gap-1 shrink-0">
              {index > 0 && <span className="text-white/30">→</span>}
              <button
                type="button"
                onClick={() => onJumpTo(stop)}
                className={`rounded-full px-2 py-0.5 ${
                  index === trail.length - 1 ? "bg-white text-zinc-900 font-semibold" : "hover:text-white"
                }`}
              >
                {stop.name}
              </button>
            </span>
          ))}
        </nav>
      )}

      <div className="relative flex-1 min-h-0 flex items-center justify-center px-3">
        <div className="relative w-full max-w-[380px] aspect-square">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" aria-hidden>
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
                <stop offset="100%" stopColor="rgba(244,63,94,0.7)" />
              </linearGradient>
            </defs>
            {nearby.map((row, index) => {
              const point = polar(index, nearby.length, 34)
              return (
                <path
                  key={row.dest.id}
                  d={branchPath(point.x, point.y)}
                  fill="none"
                  stroke={`url(#${gradientId})`}
                  strokeWidth="0.7"
                  strokeLinecap="round"
                  className="destination-branch-line"
                  style={{ animationDelay: `${80 + index * 70}ms` }}
                />
              )
            })}
          </svg>

          <button
            type="button"
            onClick={() => onOpenMap(hub)}
            className="destination-branch-hub absolute left-1/2 top-1/2 z-10 flex h-[5.75rem] w-[5.75rem] flex-col items-center justify-end overflow-hidden rounded-full border-2 border-white shadow-[0_0_0_6px_rgba(244,63,94,0.35)]"
            aria-label={`Open map for ${hub.name}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hub.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="relative z-10 w-full bg-black/55 py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white">
              {hub.name}
            </span>
          </button>

          {nearby.map((row, index) => {
            const point = polar(index, nearby.length, 34)
            const count = counts[row.dest.name] ?? 0
            return (
              <button
                key={row.dest.id}
                type="button"
                onClick={() => onBranchTo(row.dest)}
                className="destination-branch-node absolute z-10 flex w-[4.5rem] flex-col items-center"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  animationDelay: `${120 + index * 70}ms`,
                }}
                aria-label={`Branch to ${row.dest.name}, ${row.note}`}
              >
                <span className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white/90 shadow-lg shadow-black/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={row.dest.image} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="mt-1 max-w-[5.5rem] truncate text-center text-[11px] font-bold text-white drop-shadow">
                  {row.dest.name}
                </span>
                <span className="text-[10px] text-white/70">{row.note}</span>
                {count > 0 && (
                  <span className="mt-0.5 rounded-full bg-white px-1.5 text-[10px] font-bold text-zinc-900">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
        <p className="mb-2 text-center text-[11px] text-white/55">
          Tap a nearby place to keep branching. Tap the center to open the map.
        </p>
        <button
          type="button"
          onClick={() => onOpenMap(hub)}
          className="w-full rounded-full bg-rose-500 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/30"
        >
          {hub.comingSoon && hubCount === 0
            ? `Open map · ${hub.name}`
            : `See tours in ${hub.name}${hubCount ? ` · ${hubCount}` : ""}`}
        </button>
      </div>
    </div>,
    document.body
  )
}
