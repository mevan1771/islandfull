"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const SUPPORT_LINKS = [
  { href: "/help", label: "Help Center" },
  { href: "/cancellation-policy", label: "Cancellations" },
  { href: "/contact", label: "Contact" },
  { href: "/legal", label: "Terms & Privacy" },
  { href: "/list-your-tour", label: "List a tour" },
]

export function SupportSubnav() {
  const pathname = usePathname()

  return (
    <div className="sticky top-16 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {SUPPORT_LINKS.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs md:text-sm font-semibold transition-colors ${
                active
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-rose-200 hover:text-rose-600"
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
