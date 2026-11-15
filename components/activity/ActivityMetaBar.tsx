"use client"

import { useEffect, useState } from "react"
import { Clock, Users } from "lucide-react"
import { incrementActivityView } from "@/app/actions/tracking"
import { CountdownTimer } from "@/components/ui/CountdownTimer"
import { ViewedByTravelers } from "@/components/activity/ViewedByTravelers"

interface ActivityMetaBarProps {
  tourId: string
  location: string
  duration?: string | null
  capacityLabel: string
  initialViews: number
  initialViewsToday?: number
  dealEndDate?: string | null
  hasActiveDeal?: boolean
  hideCapacity?: boolean
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
  initialViews,
  initialViewsToday = 0,
  dealEndDate,
  hasActiveDeal,
  hideCapacity,
}: ActivityMetaBarProps) {
  const [views, setViews] = useState(initialViews)
  const [viewsToday, setViewsToday] = useState(initialViewsToday)

  useEffect(() => {
    incrementActivityView(tourId).then((result) => {
      if (result.success && result.incremented && result.view_count != null) {
        setViews(result.view_count)
        if (result.views_today != null) setViewsToday(result.views_today)
      }
    })
  }, [tourId])

  return (
    <div className="flex flex-col items-start gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3 w-full pt-2 md:pt-0">
      <div className="flex flex-nowrap items-center justify-start gap-1.5 md:gap-3 w-full md:w-auto overflow-x-auto hide-scrollbar md:overflow-visible">
        <span className={`inline-flex ${rosePill}`}>{location}</span>

        {!hideCapacity && (
        <span className={`inline-flex ${whitePill}`} aria-label={`${capacityLabel} guests`}>
          <Users className={`${iconClass} text-rose-500`} />
          {capacityLabel}
        </span>
        )}

        {duration && (
          <span className={`inline-flex ${whitePill}`}>
            <Clock className={`${iconClass} text-rose-500`} />
            <span className="md:hidden">{compactDuration(duration)}</span>
            <span className="hidden md:inline">{duration}</span>
          </span>
        )}

        <ViewedByTravelers total={views} today={viewsToday} />
      </div>

      {hasActiveDeal && dealEndDate && (
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <CountdownTimer targetDate={dealEndDate} compact />
        </div>
      )}
    </div>
  )
}
