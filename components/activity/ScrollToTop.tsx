"use client"

import { useEffect } from 'react'

export function ScrollToTop() {
  useEffect(() => {
    // Force scroll to top on mount to prevent any rogue focus/scroll jumping
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  return null
}
