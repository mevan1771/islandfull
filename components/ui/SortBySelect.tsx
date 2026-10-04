"use client"

import { ArrowDownUp } from "lucide-react"
import { TOUR_SORT_OPTIONS, type TourSort } from "@/lib/tour-sort"

export function SortBySelect({
  value,
  onChange,
}: {
  value: TourSort
  onChange: (value: TourSort) => void
}) {
  return (
    <label className="relative inline-flex items-center shrink-0">
      <span className="sr-only">Sort by</span>
      <ArrowDownUp className="pointer-events-none absolute left-3 w-3.5 h-3.5 text-zinc-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TourSort)}
        className="appearance-none bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 text-xs md:text-sm font-medium rounded-full pl-8 pr-8 py-2 shadow-sm cursor-pointer outline-none focus:border-zinc-400"
      >
        {TOUR_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
