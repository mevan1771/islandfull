"use client"

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { markHomeListingsPin } from "@/lib/home-scroll"
import { resolveCategoryIcon } from "@/lib/category-icons"

type Chip = {
  id: string
  name: string
  iconSrc?: string | null
  kind?: "all" | "saved" | "tag"
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
    { id: "all", name: "All", kind: "all" },
    { id: "saved", name: "Saved", kind: "saved" },
    ...dynamicCategories.map((category) => ({
      id: category.slug || "",
      name: category.name || "",
      iconSrc: resolveCategoryIcon(category),
      kind: "tag" as const,
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
    markHomeListingsPin()
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId !== "all") params.set("category", categoryId)
    else params.delete("category")
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
  }

  const iconBox = compact ? "h-10 w-10" : "h-12 w-12 md:h-14 md:w-14"

  return (
    <div
      ref={scrollerRef}
      className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-1 md:gap-2 items-end [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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
            className="flex flex-col items-center justify-end shrink-0 min-w-[3.6rem] md:min-w-[4.25rem] px-1.5 pb-0.5 cursor-pointer touch-manipulation select-none active:scale-95 transition-transform"
          >
            <span
              className={`flex ${iconBox} items-center justify-center rounded-2xl ${
                current ? "bg-zinc-100" : "bg-transparent"
              }`}
            >
              {cat.kind === "all" ? (
                <span
                  className={`h-7 w-7 md:h-8 md:w-8 rounded-full ${
                    current ? "bg-zinc-900" : "bg-zinc-200"
                  }`}
                />
              ) : cat.kind === "saved" ? (
                <Heart
                  className={`w-6 h-6 ${current ? "fill-rose-500 text-rose-500" : "text-zinc-400"}`}
                />
              ) : cat.iconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.iconSrc}
                  alt=""
                  width={56}
                  height={56}
                  className="h-full w-full object-contain mix-blend-multiply"
                />
              ) : (
                <span className="h-full w-full" />
              )}
            </span>
            <span
              className={`mt-0.5 min-h-[1rem] max-w-[4.5rem] truncate text-[11px] md:text-xs leading-tight ${
                current
                  ? "font-bold text-zinc-900 border-b-2 border-zinc-900"
                  : "font-medium text-zinc-500"
              }`}
            >
              {cat.kind === "saved" ? "\u00a0" : cat.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
