"use client"

import { useLayoutEffect, useRef } from "react"
import {
  consumeHomeArriveTop,
  consumeHomeListingsPin,
  consumeHomeScrollRestore,
  currentHomeScrollGeneration,
  jumpHomeScroll,
  peekHomeListingsPin,
  peekHomeScrollRestore,
  restoreHomeScroll,
  scrollHomeListingsToStart,
  shouldResetHomeToTop,
} from "@/lib/home-scroll"

function pinUntilSettled(apply: () => void, onDone: () => void) {
  const generation = currentHomeScrollGeneration()
  let cancelled = false
  const run = () => {
    if (cancelled || generation !== currentHomeScrollGeneration()) {
      cancelled = true
      return
    }
    apply()
  }

  run()

  const frames = [
    requestAnimationFrame(run),
    requestAnimationFrame(() => requestAnimationFrame(run)),
  ]
  const timers = [40, 120, 280].map((ms) => window.setTimeout(run, ms))
  const done = window.setTimeout(() => {
    if (!cancelled) onDone()
  }, 360)

  const stopWhenUserMoves = () => {
    if (cancelled) return
    cancelled = true
    onDone()
  }
  window.addEventListener("pointerdown", stopWhenUserMoves, { passive: true })
  window.addEventListener("wheel", stopWhenUserMoves, { passive: true })
  window.addEventListener("touchstart", stopWhenUserMoves, { passive: true })

  return () => {
    cancelled = true
    frames.forEach((id) => cancelAnimationFrame(id))
    timers.forEach((id) => window.clearTimeout(id))
    window.clearTimeout(done)
    window.removeEventListener("pointerdown", stopWhenUserMoves)
    window.removeEventListener("wheel", stopWhenUserMoves)
    window.removeEventListener("touchstart", stopWhenUserMoves)
  }
}

export function HomeScrollRestore({ listingKey }: { listingKey: string }) {
  const prevListingKey = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (peekHomeListingsPin()) {
      return pinUntilSettled(
        () => scrollHomeListingsToStart({ blockClicks: false }),
        () => consumeHomeListingsPin()
      )
    }

    const forceTop = shouldResetHomeToTop()
    if (!forceTop && peekHomeScrollRestore() == null) return

    return pinUntilSettled(
      () => {
        if (peekHomeListingsPin()) {
          scrollHomeListingsToStart({ blockClicks: false })
          return
        }
        if (forceTop) jumpHomeScroll(0)
        else restoreHomeScroll()
      },
      () => {
        if (peekHomeListingsPin()) consumeHomeListingsPin()
        else if (forceTop) consumeHomeArriveTop()
        else consumeHomeScrollRestore()
      }
    )
  }, [])

  useLayoutEffect(() => {
    if (prevListingKey.current == null) {
      prevListingKey.current = listingKey
      return
    }
    if (prevListingKey.current === listingKey) return
    prevListingKey.current = listingKey

    // Category tags only swap cards. Do not jump the page unless search/vertical
    // explicitly asked to pin listings into view.
    if (!peekHomeListingsPin()) return

    return pinUntilSettled(
      () => scrollHomeListingsToStart({ blockClicks: false }),
      () => consumeHomeListingsPin()
    )
  }, [listingKey])

  return null
}
