"use client"

import { useLayoutEffect } from "react"

export function RouteFallback() {
  useLayoutEffect(() => {
    document.documentElement.setAttribute("data-route-fallback", "")
    window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    return () => {
      document.documentElement.removeAttribute("data-route-fallback")
    }
  }, [])

  return (
    <div
      data-route-fallback
      className="min-h-[100dvh] w-full flex-1 bg-zinc-50"
      aria-hidden="true"
    />
  )
}
