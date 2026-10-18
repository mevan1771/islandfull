"use client"

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react"
import { Heart, type LucideIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { markHomeListingsPin } from "@/lib/home-scroll"

type Chip = {
  id: string
  name: string
  icon?: LucideIcon
}

export function HomeCategoryChips({
  dynamicCategories = [],
  compact = false,
  passive = false,
}: {
  dynamicCategories?: { slug?: string; name?: string }[]
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
    { id: "all", name: "All" },
    { id: "saved", name: "", icon: Heart },
    ...dynamicCategories.map((category) => ({ id: category.slug || "", name: category.name || "" })),
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
    markHomeListingsPin()
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId !== "all") params.set("category", categoryId)
    else params.delete("category")
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
  }

  const height = compact ? "h-9" : "h-10 md:h-11"
  const savedSize = compact ? "w-9" : "w-10 md:w-11"

  return (
    <div
      ref={scrollerRef}
      className={`flex min-w-0 flex-1 ${height} overflow-x-auto flex-nowrap whitespace-nowrap gap-1.5 md:gap-3 items-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
    >
      {categories.map((cat) => {
        const Icon = cat.icon || null
        const current = optimisticCategory === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            data-chip-current={current ? "true" : undefined}
            aria-current={current ? "true" : undefined}
            onClick={() => handleCategoryClick(cat.id)}
            className={`flex items-center justify-center shrink-0 ${height} rounded-full transition-transform duration-75 ease-out active:scale-95 border cursor-pointer touch-manipulation ${
              cat.id === "saved" ? `${savedSize} p-0` : "gap-1.5 px-3 md:px-4 text-[13px] md:text-base font-medium"
            } ${
              current
                ? "bg-black text-white border-black shadow-md"
                : "bg-white text-zinc-600 border-gray-300"
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 ${
                  cat.id === "saved"
                    ? optimisticCategory === cat.id
                      ? "fill-rose-500 text-rose-500"
                      : "text-zinc-600"
                    : optimisticCategory === cat.id
                      ? "fill-white"
                      : ""
                }`}
              />
            )}
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}
