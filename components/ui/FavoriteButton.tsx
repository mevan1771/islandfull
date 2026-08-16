"use client"

import { Heart } from "lucide-react"
import { useFavorites } from "@/hooks/useFavorites"

import { twMerge } from "tailwind-merge"

interface FavoriteButtonProps {
  activityId: string
  className?: string
  variant?: 'overlay' | 'inline'
}

export function FavoriteButton({ activityId, className, variant = 'overlay' }: FavoriteButtonProps) {
  const { favorites, toggleFavorite, isHydrated } = useFavorites()

  const overlayClasses = "absolute top-4 right-4 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-black/20 sm:bg-white/10 border-transparent sm:border sm:border-white/20 backdrop-blur-md sm:backdrop-blur-sm shadow-sm sm:shadow-xl z-10"
  const inlineClasses = "relative w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 shadow-sm shrink-0"

  const defaultClasses = variant === 'inline' ? inlineClasses : overlayClasses

  if (!isHydrated) {
    return (
      <button className={twMerge(defaultClasses, "opacity-50 cursor-default", className)}>
        <Heart className={twMerge("w-4 h-4 sm:w-5 sm:h-5", variant === 'overlay' ? "drop-shadow-md text-white/90" : "text-zinc-400")} />
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
      className={twMerge(
        defaultClasses,
        "transition-all duration-300 hover:scale-105 active:scale-95",
        variant === 'overlay' ? (
          isSaved
            ? "bg-black/20 sm:bg-rose-500 sm:border-rose-500 sm:hover:bg-rose-600"
            : "bg-black/20 sm:bg-white/10 sm:border-white/20 sm:hover:bg-white/20"
        ) : (
          isSaved
            ? "bg-rose-50 border-rose-200 hover:bg-rose-100"
            : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200"
        ),
        className
      )}
      aria-label={isSaved ? "Remove from saved" : "Save to favorites"}
    >
      <Heart
        className={twMerge(
          "w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300",
          variant === 'overlay' ? "drop-shadow-md" : "",
          variant === 'overlay' ? (
            isSaved ? "fill-rose-500 text-rose-500 sm:fill-white sm:text-white" : "text-white/90 hover:text-white"
          ) : (
            isSaved ? "fill-rose-500 text-rose-500" : "text-zinc-400 hover:text-zinc-600"
          )
        )}
      />
    </button>
  )
}
