"use client"

import { useLayoutEffect, useRef } from "react"
import {
  consumeHomeArriveTop,
  consumeHomeListingsPin,
  consumeHomeScrollRestore,
  jumpHomeScroll,
  peekHomeListingsPin,
  peekHomeScrollRestore,
  restoreHomeScroll,
  scrollHomeListingsToStart,
  shouldResetHomeToTop,
} from "@/lib/home-scroll"

function pinUntilSettled(apply: (blockClicks: boolean) => void, onDone: () => void) {
  let cancelled = false
  const run = (blockClicks: boolean) => {
    if (cancelled) return
    apply(blockClicks)
  }

  run(true)

  const frames = [
    requestAnimationFrame(() => run(false)),
    requestAnimationFrame(() => requestAnimationFrame(() => run(false))),
  ]
  const timers = [50, 120, 250, 450, 800, 1400].map((ms) => window.setTimeout(() => run(false), ms))
  const done = window.setTimeout(() => {
    if (cancelled) return
    onDone()
  }, 1600)

  const ignoreGesturesUntil = Date.now() + 400
  const stopWhenUserMoves = () => {
    if (cancelled || Date.now() < ignoreGesturesUntil) return
    cancelled = true
    onDone()
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
        if (forceTop) jumpHomeScroll(0)
        else restoreHomeScroll()
      },
      () => {
        if (forceTop) consumeHomeArriveTop()
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

    return pinUntilSettled(
      () => scrollHomeListingsToStart({ blockClicks: false }),
      () => consumeHomeListingsPin()
    )
  }, [listingKey])

  return null
}
