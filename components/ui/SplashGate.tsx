"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import SplashLoading from "@/components/ui/SplashLoading"

const MIN_MS = 2800
const SKIP_PREFIXES = ["/host", "/admin", "/sign-in", "/sign-up"]

export function SplashGate() {
  const pathname = usePathname()
  const skipped = SKIP_PREFIXES.some((prefix) => pathname?.startsWith(prefix))
  const [show, setShow] = useState(!skipped)

  useEffect(() => {
    if (!show) return

    const root = document.documentElement
    const scrollbar = Math.max(0, window.innerWidth - root.clientWidth)
    root.style.overflow = "hidden"
    root.style.paddingRight = `${scrollbar}px`

    const timeout = window.setTimeout(() => setShow(false), MIN_MS)
    return () => {
      window.clearTimeout(timeout)
      root.style.overflow = ""
      root.style.paddingRight = ""
    }
  }, [show])

  if (!show) return null
  return <SplashLoading />
}
