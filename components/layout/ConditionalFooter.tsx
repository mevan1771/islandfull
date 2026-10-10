"use client"

import { usePathname } from "next/navigation"
import SiteFooter from "./SiteFooter"

export function ConditionalFooter() {
  const pathname = usePathname()

  if (
    pathname === "/map" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/host") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ) {
    return null
  }

  return (
    <div className={pathname === "/destinations" ? "pb-16 lg:pb-0" : undefined}>
      <SiteFooter />
    </div>
  )
}
