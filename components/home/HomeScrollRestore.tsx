"use client"

import { useLayoutEffect } from "react"
import {
  consumeHomeArriveTop,
  consumeHomeScrollRestore,
  jumpHomeScroll,
  peekHomeArriveTop,
  peekHomeScrollRestore,
  restoreHomeScroll,
} from "@/lib/home-scroll"

export function HomeScrollRestore() {
  useLayoutEffect(() => {
    const forceTop = peekHomeArriveTop()
    if (!forceTop && peekHomeScrollRestore() == null) return

    let cancelled = false
    const apply = () => {
      if (cancelled) return
      if (forceTop) jumpHomeScroll(0)
      else restoreHomeScroll()
    }

    apply()

    const frames = [
      requestAnimationFrame(apply),
      requestAnimationFrame(() => requestAnimationFrame(apply)),
    ]
    const timers = [50, 120, 250, 450, 800, 1400].map((ms) => window.setTimeout(apply, ms))
    const done = window.setTimeout(() => {
      if (cancelled) return
      if (forceTop) consumeHomeArriveTop()
      else consumeHomeScrollRestore()
    }, 1600)

    const ignoreGesturesUntil = Date.now() + 600
    const stopWhenUserMoves = () => {
      if (cancelled || Date.now() < ignoreGesturesUntil) return
      cancelled = true
      if (forceTop) consumeHomeArriveTop()
      else consumeHomeScrollRestore()
    }
    window.addEventListener("touchstart", stopWhenUserMoves, { passive: true })
    window.addEventListener("wheel", stopWhenUserMoves, { passive: true })

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
