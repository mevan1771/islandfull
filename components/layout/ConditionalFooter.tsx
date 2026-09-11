"use client"

import { usePathname } from "next/navigation"
import SiteFooter from "./SiteFooter"

export function ConditionalFooter() {
  const pathname = usePathname()
  
  if (pathname === '/map' || pathname === '/destinations') {
    return null
  }
  
  return <SiteFooter />
}
