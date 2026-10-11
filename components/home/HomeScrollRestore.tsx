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
    const done = window.setTimeout(() => consumeHomeScrollRestore(), 300)
    return () => window.clearTimeout(done)
  }, [])

  return null
}
