"use client"

import { ReactNode } from "react"

/** Native OS scrolling. Lenis lerp was damping fast wheel/trackpad flicks. */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}
