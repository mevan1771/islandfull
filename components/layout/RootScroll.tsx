"use client"

import { useLayoutEffect } from "react"
import { installHomeScrollPopstate, jumpHomeScroll, shouldResetHomeToTop } from "@/lib/home-scroll"

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
    return () => {
      window.removeEventListener("pageshow", onPageShow)
    }
  }, [])

  return null
}
