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

    restoreHomeScroll()

    let cancelled = false
    const retry = window.setTimeout(() => {
      if (!cancelled) restoreHomeScroll()
    }, 80)
    const done = window.setTimeout(() => {
      if (!cancelled) {
        restoreHomeScroll()
        consumeHomeScrollRestore()
      }
    }, 450)

    return () => {
      cancelled = true
      window.clearTimeout(retry)
      window.clearTimeout(done)
    }
  }, [])

  return null
}
