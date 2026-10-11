"use client"

import { useLayoutEffect } from "react"
import { peekHomeScrollRestore } from "@/lib/home-scroll"

function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse bg-zinc-200/80 ${className}`} />
}

function HomeSkeleton() {
  return (
    <div className="min-h-[100dvh] w-full bg-zinc-50" data-route-fallback>
      <div className="w-full h-[70vh] min-h-[22rem] bg-zinc-200/80 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 mt-6 md:mt-10">
        <div className="flex gap-2 overflow-hidden mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Pulse key={i} className="h-10 w-24 shrink-0 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-16">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <Pulse className="w-full aspect-[4/3] rounded-2xl" />
              <Pulse className="w-3/4 h-4 rounded" />
              <Pulse className="w-1/2 h-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActivitySkeleton() {
  return (
    <div className="min-h-[100dvh] w-full bg-white" data-route-fallback>
      <div className="px-4 mx-auto max-w-7xl pt-16 md:pt-20">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-2 md:gap-2.5 h-[35svh] md:h-[480px]">
          <Pulse className="h-full min-h-0 rounded-2xl sm:rounded-3xl" />
          <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2 md:gap-2.5 h-full min-h-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <Pulse key={i} className="h-full min-h-0 rounded-2xl sm:rounded-3xl" />
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 md:py-12 flex flex-col md:flex-row gap-4 md:gap-12">
        <div className="flex-1 space-y-6 md:space-y-8">
          <div className="space-y-3">
            <Pulse className="h-8 md:h-10 w-2/3 rounded-lg" />
            <div className="flex flex-wrap gap-2">
              <Pulse className="h-8 w-24 rounded-full" />
              <Pulse className="h-8 w-14 rounded-full" />
              <Pulse className="h-8 w-16 rounded-full" />
              <Pulse className="h-8 w-14 rounded-full" />
            </div>
          </div>
          <div className="space-y-3">
            <Pulse className="h-6 w-48 rounded" />
            <Pulse className="h-4 w-full rounded" />
            <Pulse className="h-4 w-full rounded" />
            <Pulse className="h-4 w-5/6 rounded" />
            <Pulse className="h-4 w-4/6 rounded" />
          </div>
          <Pulse className="h-[14px] w-44 rounded-2xl md:h-20" />
        </div>
        <div className="hidden md:block w-full max-w-[360px] shrink-0">
          <div className="rounded-3xl border border-zinc-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <Pulse className="h-9 w-24 rounded-lg" />
              <Pulse className="h-7 w-14 rounded-full" />
            </div>
            <Pulse className="h-[280px] w-full rounded-2xl" />
            <Pulse className="h-[52px] w-full rounded-xl" />
            <Pulse className="h-4 w-40 mx-auto rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function RouteFallback({ variant = "home" }: { variant?: "home" | "activity" }) {
  const restoringHome = variant === "home" && peekHomeScrollRestore() != null

  useLayoutEffect(() => {
    if (restoringHome) return
    document.documentElement.setAttribute("data-route-fallback", "")
    if (peekHomeScrollRestore() == null) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }
    return () => {
      document.documentElement.removeAttribute("data-route-fallback")
    }
  }, [restoringHome])

  if (restoringHome) return null

  return variant === "activity" ? <ActivitySkeleton /> : <HomeSkeleton />
}
