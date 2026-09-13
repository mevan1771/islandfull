"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Users, Eye, Heart } from "lucide-react"
import { incrementActivityView } from "@/app/actions/tracking"
import { CountdownTimer } from "@/components/ui/CountdownTimer"

interface ActivityMetaBarProps {
  tourId: string
  location: string
  duration?: string | null
  capacityLabel: string
  initialLikes: number
  initialViews: number
  dealEndDate?: string | null
  hasActiveDeal?: boolean
}

function formatNumber(num: number) {
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return num.toString()
}

function compactDuration(value: string) {
  return value
    .replace(/(\d+)\s*hours?/gi, "$1h")
    .replace(/(\d+)\s*minutes?/gi, "$1m")
    .replace(/(\d+)\s*days?/gi, "$1d")
}

const rosePill =
  "items-center gap-1 md:gap-1.5 shrink-0 bg-[#fa385f] text-white text-[11px] md:text-sm font-bold tracking-wide uppercase px-2.5 py-1 md:px-5 md:py-2.5 rounded-full whitespace-nowrap"

const whitePill =
  "items-center gap-1 md:gap-1.5 shrink-0 bg-white border border-gray-200 text-gray-700 text-[11px] md:text-sm font-bold tracking-wide uppercase px-2.5 py-1 md:px-5 md:py-2.5 rounded-full whitespace-nowrap"

const iconClass = "w-3 h-3 md:w-4 md:h-4 shrink-0"

export function ActivityMetaBar({
  tourId,
  location,
  duration,
  capacityLabel,
  initialLikes,
  initialViews,
  dealEndDate,
  hasActiveDeal,
}: ActivityMetaBarProps) {
  const router = useRouter()
  const [likes, setLikes] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    incrementActivityView(tourId)
  }, [tourId])

  useEffect(() => {
    try {
      const savedLikes = JSON.parse(localStorage.getItem("islandfull_liked_tours") || "[]")
      if (Array.isArray(savedLikes) && savedLikes.includes(tourId)) {
        setHasLiked(true)
      }
    } catch {
      // Ignore malformed local storage
    }
  }, [tourId])

  const handleToggleLike = async () => {
    if (isSubmitting) return

    const nextLikedState = !hasLiked
    const nextCount = nextLikedState ? likes + 1 : Math.max(0, likes - 1)

    setHasLiked(nextLikedState)
    setLikes(nextCount)

    try {
      const savedLikes = new Set(JSON.parse(localStorage.getItem("islandfull_liked_tours") || "[]"))
      if (nextLikedState) {
        savedLikes.add(tourId)
      } else {
        savedLikes.delete(tourId)
      }
      localStorage.setItem("islandfull_liked_tours", JSON.stringify(Array.from(savedLikes)))
    } catch {
      // Continue even if local storage is unavailable
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/tours/${tourId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: nextLikedState }),
      })
      if (response.ok) {
        const data = await response.json()
        if (typeof data.likes === "number") {
          setLikes(data.likes)
        }
      }
    } catch (err) {
      console.error("Failed to sync like status:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3 w-full pt-2 md:pt-0">
      <div className="flex flex-nowrap items-center justify-start gap-1.5 md:gap-3 w-full md:w-auto overflow-x-auto hide-scrollbar md:overflow-visible">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Go back"
          className={`hidden md:inline-flex ${whitePill} hover:bg-gray-50 transition-colors`}
        >
          <ArrowLeft className={`${iconClass} text-rose-500`} />
          Back
        </button>

        <span className={`inline-flex md:hidden ${rosePill}`}>{location}</span>

        <span className={`inline-flex ${whitePill}`} aria-label={`${capacityLabel} guests`}>
          <Users className={`${iconClass} text-rose-500`} />
          {capacityLabel}
        </span>

        {duration && (
          <span className={`inline-flex ${whitePill}`}>
            <Clock className={`${iconClass} text-rose-500`} />
            <span className="md:hidden">{compactDuration(duration)}</span>
            <span className="hidden md:inline">{duration}</span>
          </span>
        )}

        <span className={`inline-flex ${whitePill}`} aria-label={`${formatNumber(initialViews)} views`}>
          <Eye className={`${iconClass} text-rose-500`} />
          {formatNumber(initialViews)}
        </span>

        <button
          type="button"
          onClick={handleToggleLike}
          aria-label="Love this tour"
          disabled={isSubmitting}
          className={`inline-flex ${hasLiked ? rosePill : whitePill} transition-transform active:scale-95 disabled:opacity-70`}
        >
          <Heart
            className={`${iconClass} ${hasLiked ? "fill-white text-white" : "text-rose-500"}`}
          />
          {formatNumber(likes)}
        </button>
      </div>

      {hasActiveDeal && dealEndDate && (
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <CountdownTimer targetDate={dealEndDate} compact />
        </div>
      )}
    </div>
  )
}
