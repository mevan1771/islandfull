"use client"

import { useLayoutEffect } from "react"

export function RootScroll() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }
  }, [])

  return null
}
