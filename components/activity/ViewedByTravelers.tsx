"use client"

import { Eye } from "lucide-react"
import { travelerViewLine } from "@/lib/view-proof"

export function ViewedByTravelers({
  total,
  today,
  compact = false,
  kind = "tour",
}: {
  total: number
  today: number
  compact?: boolean
  kind?: "tour" | "place"
}) {
  const line = travelerViewLine(total, today, kind)
  const hot = today >= 3

  return (
    <p
      className={`flex items-center gap-1.5 font-medium ${
        compact ? "text-[11px] leading-snug text-zinc-500" : "text-sm text-zinc-600"
      }`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {hot ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
        ) : null}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${hot ? "bg-rose-500" : "bg-zinc-300"}`} />
      </span>
      <Eye className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"} shrink-0 text-rose-500`} />
      <span>{line}</span>
    </p>
  )
}
