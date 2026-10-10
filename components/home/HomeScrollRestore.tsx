"use client"

import { useEffect } from "react"
import { consumeHomeScrollRestore } from "@/lib/home-scroll"

export function HomeScrollRestore() {
  useEffect(() => {
    const y = consumeHomeScrollRestore()
    if (y == null) return

    let cancelled = false
    const started = Date.now()

    const apply = () => {
      if (cancelled) return
      const height = document.documentElement.scrollHeight
      const needed = y + window.innerHeight * 0.7
      if (height < needed && Date.now() - started < 2000) {
        requestAnimationFrame(apply)
        return
      }
      window.scrollTo({ top: y, left: 0, behavior: "instant" })
    }

    apply()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
