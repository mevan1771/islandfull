"use client"

import "lenis/dist/lenis.css"
import { ReactLenis, useLenis } from "lenis/react"
import { usePathname } from "next/navigation"
import { ReactNode, useEffect } from "react"

function LenisBridge() {
  const lenis = useLenis()

  useEffect(() => {
    const win = window as unknown as { __islandfullLenis?: typeof lenis }
    win.__islandfullLenis = lenis
    return () => {
      if (win.__islandfullLenis === lenis) delete win.__islandfullLenis
    }
  }, [lenis])

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
