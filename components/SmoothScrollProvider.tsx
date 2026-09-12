"use client"

import { ReactLenis } from 'lenis/react'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const useNativeScroll = pathname === '/destinations' || pathname === '/map'

  return (
    <ReactLenis
      root
      options={
        useNativeScroll
          ? { lerp: 1, wheelMultiplier: 1, syncTouch: false }
          : { lerp: 0.15, wheelMultiplier: 1.2, syncTouch: false }
      }
    >
      {children}
    </ReactLenis>
  )
}
