"use client"

import { useLayoutEffect, useRef } from "react"
import { usePathname } from "next/navigation"

export function RootScroll() {
  const pathname = usePathname()
  const previousPath = useRef(pathname)

  useLayoutEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }
  }, [])

  useLayoutEffect(() => {
    const from = previousPath.current
    previousPath.current = pathname
    if (pathname === "/" && from !== "/") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" })
    }
  }, [pathname])

  return null
}
