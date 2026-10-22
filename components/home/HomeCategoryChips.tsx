"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ALL_CATEGORY_ICON, SAVED_CATEGORY_ICON, resolveCategoryIcon } from "@/lib/category-icons"
import { jumpHomeScroll } from "@/lib/home-scroll"
import { publicVertical } from "@/lib/homepage-feed"
import { useHomeBrowseCategories, useHomeBrowseStore } from "@/store/useHomeBrowseStore"
import type { HomepageCategory } from "@/lib/homepage-feed"

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
  dynamicCategories?: HomepageCategory[]
  compact?: boolean
  passive?: boolean
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get("category") || "all"
  const urlVertical = publicVertical(searchParams.get("vertical"))
  const browseVertical = useHomeBrowseStore((s) => s.vertical)
  const [optimisticCategory, setOptimisticCategory] = useState(currentCategory)
  const browseCategories = useHomeBrowseCategories(dynamicCategories)

  useEffect(() => {
    if (browseVertical !== urlVertical) {
      setOptimisticCategory("all")
      return
    }
    setOptimisticCategory(currentCategory)
  }, [browseVertical, urlVertical, currentCategory])

  const categories: Chip[] = [
    { id: "all", name: "All", iconSrc: ALL_CATEGORY_ICON },
    { id: "saved", name: "Saved", iconSrc: SAVED_CATEGORY_ICON },
    ...browseCategories.map((category) => ({
      id: category.slug || "",
      name: category.name || "",
      iconSrc: resolveCategoryIcon(category),
    })),
  ].filter((category) => category.id)

  const goToCategory = (categoryId: string) => {
    if (passive) return
    setOptimisticCategory(categoryId)
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId !== "all") params.set("category", categoryId)
    else params.delete("category")
    const href = `/?${params.toString()}`
    const y = window.scrollY
    router.prefetch(href)
    router.push(href, { scroll: false })
    jumpHomeScroll(y)
  }

  const iconBox = compact ? "h-12 w-12" : "h-[4.25rem] w-[4.25rem] md:h-20 md:w-20"

  return (
    <div className="flex min-w-0 flex-1 overflow-x-auto flex-nowrap gap-2 md:gap-3 items-end [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {categories.map((cat) => {
        const current = optimisticCategory === cat.id
        return (
          <button
            key={cat.id}
            type="button"
            data-chip-current={current ? "true" : undefined}
            aria-current={current ? "true" : undefined}
            aria-label={cat.name}
            onPointerDown={() => {
              if (passive) return
              const params = new URLSearchParams(searchParams.toString())
              if (cat.id !== "all") params.set("category", cat.id)
              else params.delete("category")
              router.prefetch(`/?${params.toString()}`)
            }}
            onClick={() => goToCategory(cat.id)}
            className="flex flex-col items-center justify-end shrink-0 min-w-[4.4rem] md:min-w-[5.25rem] px-1 cursor-pointer touch-manipulation select-none active:scale-90 transition-transform duration-75"
          >
            <span className={`flex ${iconBox} items-center justify-center ${current ? "scale-110" : ""}`}>
              {cat.iconSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.iconSrc}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="h-full w-full" />
              )}
            </span>
            <span
              className={`mt-1 max-w-[5.25rem] truncate text-[11px] md:text-sm leading-tight ${
                current ? "font-bold text-zinc-900" : "font-medium text-zinc-500"
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
