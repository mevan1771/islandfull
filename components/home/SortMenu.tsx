"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Check, SlidersHorizontal, X } from "lucide-react"
import * as Popover from "@radix-ui/react-popover"
import { parseTourSort, type TourSort } from "@/lib/tour-sort"

const OPTIONS: { value: TourSort; label: string; hint: string }[] = [
  { value: "recommended", label: "Recommended", hint: "Best match for most visitors" },
  { value: "price_asc", label: "Lowest price", hint: "Cheapest first" },
  { value: "price_desc", label: "Highest price", hint: "Most expensive first" },
  { value: "newest", label: "Newest", hint: "Listed most recently" },
]

function OptionList({
  value,
  onPick,
}: {
  value: TourSort
  onPick: (sort: TourSort) => void
}) {
  return (
    <div className="py-1">
      {OPTIONS.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onPick(option.value)}
            className={`flex w-full items-center gap-3 px-3 py-2.5 text-left touch-manipulation ${
              selected ? "bg-rose-50" : "hover:bg-zinc-50 active:bg-zinc-50"
            }`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              {selected ? <Check className="h-4 w-4 text-rose-500" /> : null}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-sm ${selected ? "font-bold text-zinc-900" : "font-semibold text-zinc-800"}`}>
                {option.label}
              </span>
              <span className="block text-[11px] text-zinc-500">{option.hint}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function SortMenu({
  sort,
  onSort,
  size = "md",
}: {
  sort: string
  onSort: (sort: string) => void
  size?: "sm" | "md"
}) {
  const value = parseTourSort(sort)
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [mounted, setMounted] = useState(false)
  const active = value !== "recommended"

  useEffect(() => setMounted(true), [])

  function pick(next: TourSort) {
    onSort(next)
    setOpen(false)
    setSheet(false)
  }

  function openMenu(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches) {
      setOpen(false)
      setSheet(true)
      return
    }
    setOpen((prev) => !prev)
  }

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Anchor asChild>
          <button
            type="button"
            aria-label="Sort tours"
            aria-expanded={open || sheet}
            className={`relative shrink-0 flex items-center justify-center rounded-full text-zinc-600 touch-manipulation ${
              size === "sm" ? "h-8 w-8" : "h-10 w-10 hover:bg-zinc-100"
            } ${active ? "bg-zinc-100" : ""}`}
            onClick={openMenu}
          >
            <SlidersHorizontal className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} />
            {active ? <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-rose-500" /> : null}
          </button>
        </Popover.Anchor>
        <Popover.Portal>
          <Popover.Content
            align="end"
            sideOffset={8}
            className="z-[80] w-72 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1 shadow-xl outline-none"
            onOpenAutoFocus={(event) => event.preventDefault()}
          >
            <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400">Sort by</p>
            <OptionList value={value} onPick={pick} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      {mounted && sheet
        ? createPortal(
            <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true">
              <button type="button" className="absolute inset-0 bg-zinc-900/50" aria-label="Close" onClick={() => setSheet(false)} />
              <div className="absolute inset-x-0 bottom-0 rounded-t-2xl bg-white px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 shadow-2xl">
                <div className="mb-1 flex items-center justify-between px-3">
                  <p className="text-sm font-bold text-zinc-900">Sort tours</p>
                  <button
                    type="button"
                    onClick={() => setSheet(false)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <OptionList value={value} onPick={pick} />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  )
}
