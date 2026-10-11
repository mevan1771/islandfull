"use client"

import { useLayoutEffect } from "react"
import {
  consumeHomeScrollRestore,
  jumpHomeScroll,
  peekHomeScrollRestore,
  restoreHomeScroll,
} from "@/lib/home-scroll"

export function HomeScrollRestore() {
  useLayoutEffect(() => {
    const saved = peekHomeScrollRestore()
    if (saved == null) return

    jumpHomeScroll(saved)

    let cancelled = false
    let frames = 0

    const apply = () => {
      if (cancelled) return
      try {
        restoreHomeScroll()
      } catch {
        // Never crash the home page over scroll restore.
      }
      frames += 1
      if (frames < 12) {
        requestAnimationFrame(apply)
        return
      }
      consumeHomeScrollRestore()
    }

    apply()

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && peekHomeScrollRestore() != null) {
        const y = peekHomeScrollRestore()
        if (y != null) jumpHomeScroll(y)
      }
    }
    window.addEventListener("pageshow", onPageShow)

    return () => {
      cancelled = true
      window.removeEventListener("pageshow", onPageShow)
    }
  }, [])

  return null
}
