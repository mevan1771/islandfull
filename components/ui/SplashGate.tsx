"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import SplashLoading from "@/components/ui/SplashLoading"

const MIN_MS = 2800
const SKIP_PREFIXES = ["/host", "/admin", "/sign-in", "/sign-up", "/email-preview"]

export function SplashGate() {
  const pathname = usePathname()
  const skipped =
    SKIP_PREFIXES.some((prefix) => pathname?.startsWith(prefix)) ||
    pathname === "/" ||
    pathname === "/transport"
  const [show, setShow] = useState(!skipped)

  useEffect(() => {
    const root = document.documentElement
    if (!show) {
      root.classList.remove("splash-lock")
      return
    }
    root.classList.add("splash-lock")
    const timeout = window.setTimeout(() => setShow(false), MIN_MS)
    return () => window.clearTimeout(timeout)
  }, [show])

  if (!show) return null
  return <SplashLoading />
}
