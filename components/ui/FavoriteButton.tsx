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
      <button className="absolute top-4 right-4 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/20 sm:bg-white/10 border-transparent sm:border sm:border-white/20 backdrop-blur-md sm:backdrop-blur-sm shadow-sm sm:shadow-xl opacity-50 cursor-default z-10">
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
      className={`absolute top-4 right-4 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full backdrop-blur-md sm:backdrop-blur-sm shadow-sm sm:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 z-10 sm:border ${
        isSaved 
          ? "bg-black/20 sm:bg-rose-500 sm:border-rose-500 sm:hover:bg-rose-600" 
          : "bg-black/20 sm:bg-white/10 sm:border-white/20 sm:hover:bg-white/20"
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
