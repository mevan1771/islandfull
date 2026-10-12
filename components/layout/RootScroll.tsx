"use client"

import { useLayoutEffect } from "react"
import { homeClicksBlocked, installHomeScrollPopstate, jumpHomeScroll, shouldResetHomeToTop } from "@/lib/home-scroll"

export function RootScroll() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }
    installHomeScrollPopstate()

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted && shouldResetHomeToTop()) jumpHomeScroll(0)
    }
    window.addEventListener("pageshow", onPageShow)

    const stopGhostClick = (event: Event) => {
      if (!homeClicksBlocked()) return
      event.preventDefault()
      event.stopPropagation()
    }
    document.addEventListener("click", stopGhostClick, true)
    document.addEventListener("pointerup", stopGhostClick, true)
    return () => {
      window.removeEventListener("pageshow", onPageShow)
      document.removeEventListener("click", stopGhostClick, true)
      document.removeEventListener("pointerup", stopGhostClick, true)
    }
  }, [])

  return null
}
