"use client"

import { RouteFallback } from "@/components/ui/RouteFallback"
import { hasHomeScrollRestore } from "@/lib/home-scroll"

export default function Loading() {
  if (typeof window !== "undefined" && hasHomeScrollRestore()) {
    return null
  }
  return <RouteFallback />
}
