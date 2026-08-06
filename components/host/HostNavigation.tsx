"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function HostNavigation() {
  const pathname = usePathname()

  const tabs = [
    { name: "Today", href: "/host" },
    { name: "Calendar", href: "/host/calendar" },
  ]

  return (
    <div className="bg-white border-b border-zinc-200 shadow-sm w-full">
      <div className="flex px-4 overflow-x-auto max-w-4xl mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.name}
              href={tab.href}
              prefetch={true}
              className={`whitespace-nowrap py-4 px-6 font-semibold text-sm transition-colors border-b-2 ${
                isActive
                  ? "border-black text-black"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
            >
              {tab.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
