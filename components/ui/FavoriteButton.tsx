"use client"

import { Heart } from "lucide-react"
import { useFavorites } from "@/hooks/useFavorites"

interface FavoriteButtonProps {
  activityId: string
}

export function FavoriteButton({ activityId }: FavoriteButtonProps) {
  const { favorites, toggleFavorite, isHydrated } = useFavorites()

  if (!isHydrated) {
    return (
      <button className="absolute top-4 right-4 p-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm shadow-xl opacity-50 cursor-default">
        <Heart className="w-5 h-5 text-white/70" />
      </button>
    )
  }

  const isSaved = favorites.includes(activityId)

  return (
    <button 
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(activityId)
      }}
      className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-sm shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 z-10 border ${
        isSaved 
          ? "bg-rose-500 border-rose-500 hover:bg-rose-600" 
          : "bg-white/10 border-white/20 hover:bg-white/20"
      }`}
      aria-label={isSaved ? "Remove from saved" : "Save to favorites"}
    >
      <Heart 
        className={`w-5 h-5 transition-colors duration-300 ${
          isSaved ? "fill-white text-white" : "text-white/80 hover:text-white"
        }`} 
      />
    </button>
  )
}
