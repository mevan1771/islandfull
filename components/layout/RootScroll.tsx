"use client"

import { useLayoutEffect } from "react"
import { homeClicksBlocked, installHomeScrollPopstate } from "@/lib/home-scroll"

export function RootScroll() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }
    installHomeScrollPopstate()

    const stopGhostClick = (event: Event) => {
      if (!homeClicksBlocked()) return
      event.preventDefault()
      event.stopPropagation()
    }
    document.addEventListener("click", stopGhostClick, true)
    document.addEventListener("pointerup", stopGhostClick, true)
    return () => {
      document.removeEventListener("click", stopGhostClick, true)
      document.removeEventListener("pointerup", stopGhostClick, true)
    }
  }, [])

  return null
}
