"use client"

import "lenis/dist/lenis.css"
import { ReactLenis, useLenis } from "lenis/react"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect, useLayoutEffect } from "react"
import { peekHomeScrollRestore } from "@/lib/home-scroll"

function LenisBridge() {
  const lenis = useLenis()
  const pathname = usePathname()

  useEffect(() => {
    const win = window as unknown as { __islandfullLenis?: typeof lenis }
    win.__islandfullLenis = lenis
    return () => {
      if (win.__islandfullLenis === lenis) delete win.__islandfullLenis
    }
  }, [lenis])

  useLayoutEffect(() => {
    if (pathname !== "/" || !lenis) return
    const y = peekHomeScrollRestore()
    if (y == null) return
    lenis.scrollTo(y, { immediate: true, force: true })
  }, [lenis, pathname])

  return null
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const useNativeScroll = pathname === "/map" || pathname === "/destinations"

  if (useNativeScroll) {
    return <>{children}</>
  }

  return (
    <ReactLenis
      root
      options={{ lerp: 0.15, wheelMultiplier: 1.2, syncTouch: false }}
    >
      <LenisBridge />
      {children}
    </ReactLenis>
  )
}
