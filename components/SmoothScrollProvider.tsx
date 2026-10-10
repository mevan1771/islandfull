"use client"

import { ReactLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const useNativeScroll = pathname === '/map' || pathname === '/destinations'

  if (useNativeScroll) {
    return <>{children}</>
  }

  return (
    <ReactLenis
      root
      options={{ lerp: 0.15, wheelMultiplier: 1.2, syncTouch: false }}
    >
      {children}
    </ReactLenis>
  )
}
