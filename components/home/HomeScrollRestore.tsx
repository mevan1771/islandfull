"use client"

import { useLayoutEffect } from "react"
import { consumeHomeScrollRestore, jumpHomeScroll } from "@/lib/home-scroll"

export function HomeScrollRestore() {
  useLayoutEffect(() => {
    const y = consumeHomeScrollRestore()
    if (y == null) return

    let cancelled = false
    const started = Date.now()

    const apply = () => {
      if (cancelled) return
      jumpHomeScroll(y)
      const height = document.documentElement.scrollHeight
      const needed = y + window.innerHeight * 0.7
      if (height < needed && Date.now() - started < 2000) {
        requestAnimationFrame(apply)
      }
    }

    apply()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}
