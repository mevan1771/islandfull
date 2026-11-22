"use client"

import { usePathname } from "next/navigation"
import SiteFooter from "./SiteFooter"
import { useExploreMapStore } from "@/store/useExploreMapStore"

export function ConditionalFooter() {
  const pathname = usePathname()
  const mapOpen = useExploreMapStore((s) => s.open)

  if (
    (mapOpen && (pathname === "/" || pathname === "/transport")) ||
    pathname === "/map" ||
    pathname === "/transport/plan" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/offers") ||
    pathname.startsWith("/host") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  ) {
    return null
  }

  return (
    <div className={pathname === "/destinations" || pathname === "/" ? "pb-20 sm:pb-0" : undefined}>
      <SiteFooter />
    </div>
  )
}
