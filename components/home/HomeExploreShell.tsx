"use client"

import { useEffect, useMemo, useState } from "react"
import { List, X } from "lucide-react"
import { MapClientWrapper } from "@/components/map/MapClientWrapper"
import type { MapTour } from "@/components/map/InteractiveMap"
import { useExploreMapStore } from "@/store/useExploreMapStore"

export function HomeExploreShell({
  children,
  mapTours,
  categories,
  vertical,
}: {
  children: React.ReactNode
  mapTours: MapTour[]
  categories: any[]
  vertical: string
}) {
  const open = useExploreMapStore((s) => s.open)
  const setOpen = useExploreMapStore((s) => s.setOpen)
  const [mounted, setMounted] = useState(false)
  const [resizeToken, setResizeToken] = useState(0)

  const pins = useMemo(
    () => mapTours.filter((tour) => (tour.category_type || "tour") === vertical),
    [mapTours, vertical]
  )

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => setResizeToken((n) => n + 1), 420)
    return () => window.clearTimeout(id)
  }, [open, vertical])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, setOpen])

  useEffect(() => {
    document.documentElement.classList.toggle("explore-map-open", open)
    return () => document.documentElement.classList.remove("explore-map-open")
  }, [open])

  function onTourSelect(tour: MapTour) {
    const card = document.querySelector<HTMLElement>(`[data-home-card="${tour.slug}"]`)
    card?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <div
      className={`min-w-0 w-full ${open ? "lg:flex lg:h-[calc(100dvh-4.25rem)] lg:min-h-0 lg:overflow-hidden" : ""}`}
      data-explore-map={open ? "open" : "closed"}
    >
      <div
        className={`min-w-0 ${
          open ? "lg:w-[48%] lg:shrink-0 lg:overflow-y-auto lg:overscroll-contain" : "w-full"
        }`}
      >
        {children}
      </div>

      <aside
        className={`overflow-hidden bg-zinc-900 ${
          open
            ? "fixed inset-x-0 top-12 bottom-[4.25rem] z-[45] lg:static lg:inset-auto lg:z-auto lg:w-[52%] lg:h-full lg:shadow-[-18px_0_40px_rgba(15,23,42,0.12)]"
            : "hidden lg:block lg:w-0 lg:pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="relative h-full min-h-0 w-full overflow-hidden lg:border-l lg:border-white/10">
          <div className="absolute top-3 left-3 right-3 z-50 flex items-center justify-between lg:hidden">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-lg"
            >
              <List className="h-4 w-4" />
              Show list
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close map"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-800 shadow-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {mounted ? (
            <MapClientWrapper
              tours={pins}
              dynamicCategories={categories}
              currentVertical={vertical}
              embed
              captureWheel
              resizeToken={`${vertical}-${resizeToken}`}
              onTourSelect={onTourSelect}
            />
          ) : null}
        </div>
      </aside>
    </div>
  )
}
