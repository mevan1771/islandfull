"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import SplashLoading from "@/components/ui/SplashLoading"

const MIN_MS = 1800
const SKIP_PREFIXES = ["/host", "/admin", "/sign-in", "/sign-up"]

function SplashGateInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const skipped = SKIP_PREFIXES.some((prefix) => pathname?.startsWith(prefix))
  const [show, setShow] = useState(!skipped)
  const locationKey = `${pathname}?${searchParams.toString()}`

  useEffect(() => {
    if (skipped) {
      setShow(false)
      return
    }

    setShow(true)
    const timeout = window.setTimeout(() => setShow(false), MIN_MS)
    return () => window.clearTimeout(timeout)
  }, [locationKey, skipped])

  if (!show) return null
  return <SplashLoading />
}

export function SplashGate() {
  return (
    <Suspense fallback={<SplashLoading />}>
      <SplashGateInner />
    </Suspense>
  )
}
