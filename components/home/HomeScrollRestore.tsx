"use client"

import { useLayoutEffect } from "react"
import {
  consumeHomeScrollRestore,
  peekHomeScrollRestore,
  restoreHomeScroll,
} from "@/lib/home-scroll"

export function HomeScrollRestore() {
  useLayoutEffect(() => {
    if (peekHomeScrollRestore() == null) return

    let cancelled = false
    restoreHomeScroll()

    const apply = () => {
      if (!cancelled) restoreHomeScroll()
    }

    const frames = [
      requestAnimationFrame(apply),
      requestAnimationFrame(() => requestAnimationFrame(apply)),
    ]
    const timers = [50, 120, 250, 450, 800].map((ms) => window.setTimeout(apply, ms))
    const done = window.setTimeout(() => {
      if (!cancelled) consumeHomeScrollRestore()
    }, 1000)

    const stopWhenUserMoves = () => {
      if (cancelled) return
      cancelled = true
      consumeHomeScrollRestore()
    }
    window.addEventListener("touchstart", stopWhenUserMoves, { passive: true, once: true })
    window.addEventListener("wheel", stopWhenUserMoves, { passive: true, once: true })

    return () => {
      cancelled = true
      frames.forEach((id) => cancelAnimationFrame(id))
      timers.forEach((id) => window.clearTimeout(id))
      window.clearTimeout(done)
      window.removeEventListener("touchstart", stopWhenUserMoves)
      window.removeEventListener("wheel", stopWhenUserMoves)
    }
  }, [])

  return null
}
