"use client"

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ALL_CATEGORY_ICON, SAVED_CATEGORY_ICON, resolveCategoryIcon } from "@/lib/category-icons"
import { jumpHomeScroll } from "@/lib/home-scroll"

type Chip = {
  id: string
  name: string
  iconSrc?: string | null
}

export function HomeCategoryChips({
  dynamicCategories = [],
  compact = false,
  passive = false,
}: {
  dynamicCategories?: { slug?: string; name?: string; icon_url?: string | null }[]
  compact?: boolean
  passive?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const currentCategory = searchParams.get("category") || "all"
  const [optimisticCategory, setOptimisticCategory] = useState(currentCategory)
  const scrollerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOptimisticCategory(currentCategory)
  }, [currentCategory])

  const categories: Chip[] = [
    { id: "all", name: "All", iconSrc: ALL_CATEGORY_ICON },
    { id: "saved", name: "Saved", iconSrc: SAVED_CATEGORY_ICON },
    ...dynamicCategories.map((category) => ({
      id: category.slug || "",
      name: category.name || "",
      iconSrc: resolveCategoryIcon(category),
    })),
  ].filter((category) => category.id)

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const selected = scroller?.querySelector<HTMLElement>('[data-chip-current="true"]')
    if (!scroller || !selected) return
    const left = selected.offsetLeft - (scroller.clientWidth - selected.offsetWidth) / 2
    scroller.scrollLeft = Math.max(0, left)
  }, [optimisticCategory, categories.length])

  useEffect(() => {
    if (passive) return
    const grid = document.getElementById("activity-grid-container")
    if (!grid) return
    grid.style.opacity = isPending ? "0.5" : "1"
    grid.style.transition = "opacity 0.2s"
  }, [isPending, passive])

  const handleCategoryClick = (categoryId: string) => {
    if (passive) return
    setOptimisticCategory(categoryId)
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId !== "all") params.set("category", categoryId)
    else params.delete("category")
    const y = typeof window !== "undefined" ? window.scrollY : 0
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
    if (typeof window === "undefined") return
    const keep = () => jumpHomeScroll(y)
    keep()
    window.setTimeout(keep, 50)
    window.setTimeout(keep, 180)
  }

  const iconBox = compact ? "h-12 w-12" : "h-[4.25rem] w-[4.25rem] md:h-20 md:w-20"

  return (
    <div
      ref={scrollerRef}
      className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 md:gap-3 items-end snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      {categories.map((cat) => {
        const current = optimisticCategory === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            data-chip-current={current ? "true" : undefined}
            aria-current={current ? "true" : undefined}
            aria-label={cat.name}
            onClick={() => handleCategoryClick(cat.id)}
            className="flex flex-col items-center justify-end shrink-0 min-w-[4.4rem] md:min-w-[5.25rem] px-1 snap-start cursor-pointer touch-manipulation select-none active:scale-90 transition-transform duration-150"
          >
            <span
              className={`flex ${iconBox} items-center justify-center transition-[transform,filter] duration-200 ${
                current ? "scale-110" : "opacity-80 hover:opacity-100 hover:scale-105"
              }`}
            >
              {cat.iconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.iconSrc}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              ) : (
                <span className="h-full w-full" />
              )}
            </span>
            <span
              className={`mt-1 max-w-[5.25rem] truncate text-[11px] md:text-sm leading-tight ${
                current
                  ? "font-bold text-zinc-900 border-b-2 border-zinc-900"
                  : "font-medium text-zinc-500"
              }`}
            >
              {cat.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
