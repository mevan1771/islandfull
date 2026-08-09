"use client"

import { Compass, Heart } from "lucide-react"

interface MapFilterBarProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
  isTourSelected?: boolean
  dynamicCategories?: any[]
}
export function MapFilterBar({ activeCategory, onCategoryChange, isTourSelected, dynamicCategories = [] }: MapFilterBarProps) {
  const CATEGORIES: { id: string, name: string, icon?: any }[] = [
    { id: "all", name: "All", icon: Compass },
    { id: "saved", name: "", icon: Heart },
    ...dynamicCategories.map(c => ({ id: c.slug, name: c.name }))
  ]

  return (
    <div className={`absolute bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-40 transition-all duration-500 ease-out ${isTourSelected ? 'translate-y-[150%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
      <div className="flex items-center gap-1 overflow-x-auto bg-white/95 backdrop-blur-md p-1 rounded-full shadow-lg hide-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all flex-shrink-0
              ${activeCategory === cat.id 
                ? "bg-zinc-900 text-white shadow-md" 
                : "bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
          >
            {cat.icon && <cat.icon className="w-4 h-4" />}
            {cat.name && <span>{cat.name}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
