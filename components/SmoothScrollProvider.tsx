"use client"

import { ReactLenis } from 'lenis/react'
import { ReactNode } from 'react'

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root>
      {children}
    </ReactLenis>
  )
}
