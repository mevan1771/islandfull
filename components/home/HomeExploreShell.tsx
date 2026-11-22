"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
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
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "all"
  const [mounted, setMounted] = useState(false)
  const [resizeToken, setResizeToken] = useState(0)
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const pins = useMemo(() => {
    const wanted = (vertical || "tour").toLowerCase()
    const byVertical = mapTours.filter((tour) => {
      const type = (tour.category_type || "tour").toLowerCase()
      if (wanted === "tour") return type !== "transport" && type !== "hotel"
      return type === wanted
    })
    const pool = byVertical.length ? byVertical : mapTours
    if (!category || category === "all" || category === "saved") return pool
    const tagged = pool.filter(
      (tour) => tour.category === category || tour.tags?.includes(category)
    )
    return tagged.length ? tagged : pool
  }, [mapTours, vertical, category])

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => setResizeToken((n) => n + 1), 420)
    return () => window.clearTimeout(id)
  }, [open, vertical, category])

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

  useEffect(() => {
    if (!open) return
    const root = listRef.current
    if (!root) return

    const ratios = new Map<string, number>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slug = (entry.target as HTMLElement).dataset.homeCard
          if (!slug) continue
          if (entry.isIntersecting) ratios.set(slug, entry.intersectionRatio)
          else ratios.delete(slug)
        }
        let bestSlug = ""
        let bestRatio = 0
        for (const [slug, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestSlug = slug
            bestRatio = ratio
          }
        }
        if (!bestSlug) return
        const tour = pins.find((item) => item.slug === bestSlug)
        if (tour) setFocusedId(tour.id)
      },
      { root, threshold: [0.2, 0.4, 0.6, 0.8], rootMargin: "-18% 0px -42% 0px" }
    )

    const watch = () => {
      observer.disconnect()
      ratios.clear()
      root.querySelectorAll("[data-home-card]").forEach((el) => observer.observe(el))
    }
    watch()
    const mutations = new MutationObserver(watch)
    mutations.observe(root, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      mutations.disconnect()
    }
  }, [open, pins])

  const onTourSelect = useCallback((tour: MapTour) => {
    setFocusedId(tour.id)
  }, [])

  return (
    <div
      className={`min-w-0 w-full ${open ? "lg:flex lg:h-[calc(100dvh-4.25rem)] lg:min-h-0 lg:overflow-hidden" : ""}`}
      data-explore-map={open ? "open" : "closed"}
    >
      <div
        ref={listRef}
        className={`min-w-0 ${
          open
            ? "max-lg:hidden lg:w-[64%] lg:shrink-0 lg:overflow-y-auto lg:overscroll-contain hide-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            : "w-full"
        }`}
      >
        {children}
      </div>

      <aside
        className={`${
          open
            ? "fixed inset-x-0 top-12 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-[35] bg-zinc-900 lg:static lg:inset-auto lg:top-auto lg:bottom-auto lg:z-auto lg:w-[36%] lg:h-full lg:bg-transparent lg:p-3 lg:pr-4 lg:pb-4"
            : "hidden lg:block lg:w-0 lg:pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div className="relative h-full min-h-0 w-full overflow-hidden lg:rounded-3xl lg:border lg:border-white/20 lg:shadow-2xl lg:bg-zinc-900">
          {mounted ? (
            <MapClientWrapper
              tours={pins}
              dynamicCategories={categories}
              currentVertical={vertical}
              embed
              captureWheel
              activeTourId={focusedId}
              resizeToken={`${vertical}-${category}-${resizeToken}`}
              onTourSelect={onTourSelect}
            />
          ) : null}
        </div>
      </aside>
    </div>
  )
}
