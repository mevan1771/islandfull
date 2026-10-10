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
    <div className="min-h-[100dvh] w-full bg-zinc-50" data-route-fallback>
      <div className="mx-auto max-w-3xl px-4 pt-20 md:pt-8">
        <Pulse className="aspect-[4/3] w-full rounded-2xl" />
        <Pulse className="mt-6 h-8 w-2/3 rounded-lg" />
        <Pulse className="mt-3 h-4 w-1/3 rounded" />
        <div className="mt-8 space-y-3">
          <Pulse className="h-4 w-full rounded" />
          <Pulse className="h-4 w-full rounded" />
          <Pulse className="h-4 w-5/6 rounded" />
        </div>
      </div>
    </div>
  )
}

export function RouteFallback({ variant = "home" }: { variant?: "home" | "activity" }) {
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-route-fallback", "")
    if (peekHomeScrollRestore() == null) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }
    return () => {
      document.documentElement.removeAttribute("data-route-fallback")
    }
  }, [])

  return variant === "activity" ? <ActivitySkeleton /> : <HomeSkeleton />
}
