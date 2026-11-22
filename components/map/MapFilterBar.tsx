"use client"

import { ArrowLeft } from "lucide-react"
import { ALL_CATEGORY_ICON, SAVED_CATEGORY_ICON, resolveCategoryIcon } from "@/lib/category-icons"

const VERTICAL_ICONS: Record<string, string> = {
  tour: "/images/icons/tour-icon.jpg",
  transport: "/images/icons/Transport-icon.jpg",
  hotel: "/images/icons/hotel-icon.jpg",
}

function ChipImage({ src, blend }: { src?: string | null; blend?: boolean }) {
  if (!src) return null
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={20}
      height={20}
      className={`h-5 w-5 shrink-0 object-contain ${blend ? "mix-blend-multiply" : ""}`}
    />
  )
}

interface MapFilterBarProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
  isTourSelected?: boolean
  dynamicCategories?: any[]
  currentVertical: string
  onVerticalChange: (v: string) => void
}

export function MapFilterBar({
  activeCategory,
  onCategoryChange,
  isTourSelected,
  dynamicCategories = [],
  currentVertical,
  onVerticalChange,
}: MapFilterBarProps) {
  const CATEGORIES: {
    id: string
    name: string
    iconSrc?: string | null
    isVertical?: boolean
    blend?: boolean
  }[] =
    currentVertical === "all"
      ? [
          { id: "all", name: "All", iconSrc: ALL_CATEGORY_ICON },
          { id: "saved", name: "", iconSrc: SAVED_CATEGORY_ICON },
          { id: "tour", name: "Tours", iconSrc: VERTICAL_ICONS.tour, isVertical: true, blend: true },
          { id: "transport", name: "Transport", iconSrc: VERTICAL_ICONS.transport, isVertical: true, blend: true },
          { id: "hotel", name: "Hotels", iconSrc: VERTICAL_ICONS.hotel, isVertical: true, blend: true },
        ]
      : [
          { id: "back", name: "All", iconSrc: ALL_CATEGORY_ICON, isVertical: true },
          ...dynamicCategories.map((c) => ({
            id: c.slug,
            name: c.name,
            iconSrc: resolveCategoryIcon(c),
          })),
        ]

  return (
    <div
      className={`absolute left-4 right-4 z-40 transition-all duration-500 ease-out bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] md:bottom-8 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-2xl ${
        isTourSelected ? "translate-y-[150%] opacity-0 pointer-events-none" : "translate-y-0 opacity-100 pointer-events-auto"
      }`}
    >
      <div className="flex items-center justify-start w-full md:w-auto gap-0.5 md:gap-1 overflow-x-auto bg-white/95 backdrop-blur-md p-1 rounded-full shadow-lg hide-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = !cat.isVertical && activeCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (cat.isVertical) {
                  onVerticalChange(cat.id === "back" ? "all" : cat.id)
                } else {
                  onCategoryChange(cat.id)
                }
              }}
              className={`flex items-center justify-center gap-1.5 px-2.5 md:px-4 py-1.5 rounded-full text-[13px] md:text-sm font-semibold transition-colors flex-shrink-0 touch-manipulation pointer-events-auto
                ${
                  isActive
                    ? "bg-zinc-900 text-white shadow-md"
                    : "bg-transparent text-zinc-600 active:bg-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
            >
              {cat.id === "back" ? <ArrowLeft className="h-4 w-4 shrink-0" /> : <ChipImage src={cat.iconSrc} blend={cat.blend} />}
              {cat.name ? <span>{cat.name}</span> : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
