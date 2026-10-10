"use client"

import { useLayoutEffect, useState } from "react"
import { usePathname } from "next/navigation"
import SiteFooter from "./SiteFooter"

function shouldShowFooter(pathname: string) {
  if (pathname === "/map") return false
  if (typeof document === "undefined") return true
  if (document.documentElement.hasAttribute("data-route-fallback")) return false
  if (document.querySelector("[data-route-fallback]")) return false
  if (pathname === "/") return Boolean(document.querySelector("[data-home-page]"))
  return true
}

export function ConditionalFooter() {
  const pathname = usePathname()
  const [, setTick] = useState(0)

  useLayoutEffect(() => {
    const update = () => setTick((n) => n + 1)
    update()
    const main = document.querySelector("main")
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-route-fallback"],
    })
    if (main) observer.observe(main, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [pathname])

  if (!shouldShowFooter(pathname)) return null

  return (
    <div className={pathname === "/destinations" ? "pb-16 lg:pb-0" : undefined}>
      <SiteFooter />
    </div>
  )
}
