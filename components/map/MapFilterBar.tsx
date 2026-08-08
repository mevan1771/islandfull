"use client"

import { Compass, Palmtree, Waves, Mountain, Camera, Ship, Bird } from "lucide-react"

interface MapFilterBarProps {
  activeCategory: string
  onCategoryChange: (cat: string) => void
  isTourSelected?: boolean
}

const CATEGORIES = [
  { name: "All", icon: Compass },
  { name: "Surf", icon: Waves },
  { name: "History", icon: Palmtree },
  { name: "Hiking", icon: Mountain },
  { name: "Safaris", icon: Camera },
  { name: "Wildlife", icon: Bird },
  { name: "Boat Ride", icon: Ship }
]
export function MapFilterBar({ activeCategory, onCategoryChange, isTourSelected }: MapFilterBarProps) {
  return (
    <div className={`absolute bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto z-40 transition-all duration-500 ease-out ${isTourSelected ? 'translate-y-[150%] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
      <div className="flex items-center gap-2 overflow-x-auto bg-black/80 backdrop-blur-md border border-white/10 px-4 py-3 rounded-full shadow-2xl hide-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onCategoryChange(cat.name)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0
              ${activeCategory === cat.name 
                ? "bg-white text-black shadow-md" 
                : "bg-transparent text-white hover:bg-white/10"
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
