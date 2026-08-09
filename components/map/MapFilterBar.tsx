"use client"

import { Compass, Heart, ArrowLeft } from "lucide-react"

interface MapFilterBarProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
  isTourSelected?: boolean
  dynamicCategories?: any[]
  currentVertical: string
  onVerticalChange: (v: string) => void
}
export function MapFilterBar({ activeCategory, onCategoryChange, isTourSelected, dynamicCategories = [], currentVertical, onVerticalChange }: MapFilterBarProps) {
  let CATEGORIES: { id: string, name: string, icon?: any, isVertical?: boolean }[] = []

  if (currentVertical === 'all') {
    CATEGORIES = [
      { id: "all", name: "All", icon: Compass },
      { id: "saved", name: "", icon: Heart },
      { id: "tour", name: "Tours", isVertical: true },
      { id: "event", name: "Events", isVertical: true },
      { id: "transport", name: "Transport", isVertical: true }
    ]
  } else {
    CATEGORIES = [
      { id: "back", name: "All", icon: ArrowLeft, isVertical: true },
      ...dynamicCategories.map(c => ({ id: c.slug, name: c.name }))
    ]
  }

  return (
    <div className={`absolute bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-max md:max-w-2xl z-40 transition-all duration-500 ease-out ${isTourSelected ? 'translate-y-[150%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
      <div className="flex items-center justify-between md:justify-start w-full md:w-auto gap-0.5 md:gap-1 overflow-x-auto bg-white/95 backdrop-blur-md p-1 rounded-full shadow-lg hide-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = !cat.isVertical && activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                if (cat.isVertical) {
                  onVerticalChange(cat.id === 'back' ? 'all' : cat.id)
                } else {
                  onCategoryChange(cat.id)
                }
              }}
              className={`flex items-center justify-center gap-1.5 px-2.5 md:px-4 py-1.5 rounded-full text-[13px] md:text-sm font-semibold transition-all flex-shrink-0
                ${isActive 
                  ? "bg-zinc-900 text-white shadow-md" 
                  : "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
            >
              {cat.icon && (
                <cat.icon 
                  className={`w-4 h-4 ${cat.id === 'saved' && isActive ? 'text-rose-500 fill-rose-500' : ''}`} 
                />
              )}
              {cat.name && <span>{cat.name}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
