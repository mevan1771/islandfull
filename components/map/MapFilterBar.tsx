"use client"

import { Compass, Palmtree, Waves, Mountain, Camera } from "lucide-react"

interface MapFilterBarProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
}

const CATEGORIES = [
  { name: "All", icon: Compass },
  { name: "Safari", icon: Camera },
  { name: "Water", icon: Waves },
  { name: "Hiking", icon: Mountain },
  { name: "Culture", icon: Palmtree }
]

export function MapFilterBar({ activeCategory, onCategoryChange }: MapFilterBarProps) {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
      <div className="flex items-center gap-2 overflow-x-auto bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg hide-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onCategoryChange(cat.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0
              ${activeCategory === cat.name 
                ? "bg-zinc-900 text-white shadow-md" 
                : "bg-transparent text-zinc-600 hover:bg-zinc-100"
              }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
