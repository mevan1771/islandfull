"use client"

import { useLayoutEffect } from "react"
import { installHomeScrollPopstate } from "@/lib/home-scroll"

export function RootScroll() {
  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }
    installHomeScrollPopstate()
  }, [])

  return null
}
