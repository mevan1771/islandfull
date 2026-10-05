"use client"

import { ArrowDownUp, SlidersHorizontal } from "lucide-react"
import { TOUR_SORT_OPTIONS, type TourSort } from "@/lib/tour-sort"

export function SortBySelect({
  value,
  onChange,
  variant = "pill",
}: {
  value: TourSort
  onChange: (value: TourSort) => void
  variant?: "pill" | "icon"
}) {
  if (variant === "icon") {
    return (
      <label className="relative w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-white text-zinc-600 shadow-sm ring-1 ring-zinc-200/80">
        <span className="sr-only">Sort by</span>
        <SlidersHorizontal className="w-4 h-4" />
        {value !== "recommended" ? (
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
        ) : null}
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as TourSort)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Sort by"
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
