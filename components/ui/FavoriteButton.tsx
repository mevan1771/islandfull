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
      <button className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1 sm:p-2.5 sm:rounded-full sm:bg-white/10 sm:border sm:border-white/20 sm:backdrop-blur-sm sm:shadow-xl opacity-50 cursor-default z-10">
        <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white/90 drop-shadow-md" />
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
      className={`absolute top-2 right-2 sm:top-4 sm:right-4 p-1 sm:p-2.5 rounded-full sm:backdrop-blur-sm sm:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 z-10 sm:border ${
        isSaved 
          ? "sm:bg-rose-500 sm:border-rose-500 sm:hover:bg-rose-600" 
          : "sm:bg-white/10 sm:border-white/20 sm:hover:bg-white/20"
      }`}
      aria-label={isSaved ? "Remove from saved" : "Save to favorites"}
    >
      <Heart 
        className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300 drop-shadow-md ${
          isSaved ? "fill-rose-500 text-rose-500 sm:fill-white sm:text-white" : "text-white/90 hover:text-white"
        }`} 
      />
    </button>
  )
}
