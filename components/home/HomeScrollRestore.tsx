"use client"

import { useEffect } from "react"
import { consumeHomeScrollRestore } from "@/lib/home-scroll"

export function HomeScrollRestore() {
  useEffect(() => {
    const y = consumeHomeScrollRestore()
    if (y == null) return

    const apply = () => window.scrollTo({ top: y, left: 0, behavior: "instant" })
    apply()
    requestAnimationFrame(apply)
  }, [])

  return null
}
