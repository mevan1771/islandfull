"use client"

import { Eye } from "lucide-react"
import { travelerViewLabel } from "@/lib/view-proof"

const whitePill =
  "inline-flex items-center gap-1 md:gap-1.5 shrink-0 bg-white border border-gray-200 text-gray-700 text-[11px] md:text-sm font-bold tracking-wide uppercase px-2.5 py-1 md:px-5 md:py-2.5 rounded-full whitespace-nowrap"

export function ViewedByTravelers({
  total,
  today,
}: {
  total: number
  today: number
}) {
  return (
    <span className={whitePill} aria-label={travelerViewLabel(total, today)}>
      <Eye className="w-3 h-3 md:w-4 md:h-4 shrink-0 text-rose-500" />
      {travelerViewLabel(total, today)}
    </span>
  )
}
