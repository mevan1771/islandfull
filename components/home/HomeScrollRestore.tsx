"use client"

import { useLayoutEffect } from "react"
import { consumeHomeScrollRestore, peekHomeScrollRestore, restoreHomeScroll } from "@/lib/home-scroll"

export function HomeScrollRestore() {
  useLayoutEffect(() => {
    if (peekHomeScrollRestore() == null) return

    let cancelled = false
    const started = Date.now()
    let foundAt = 0

    const apply = () => {
      if (cancelled) return
      try {
        if (restoreHomeScroll() && !foundAt) foundAt = Date.now()
      } catch {
        // Never crash the home page over scroll restore.
      }
      const elapsed = Date.now() - started
      const lockLenis = foundAt !== 0 && Date.now() - foundAt < 500
      if ((!foundAt && elapsed < 2800) || lockLenis) {
        requestAnimationFrame(apply)
        return
      }
      consumeHomeScrollRestore()
    }

    apply()

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && peekHomeScrollRestore() != null) apply()
    }
    window.addEventListener("pageshow", onPageShow)

    return () => {
      cancelled = true
      window.removeEventListener("pageshow", onPageShow)
    }
  }, [])

  return null
}
