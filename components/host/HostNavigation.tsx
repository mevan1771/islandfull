"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function HostNavigation({ offerCount = 0 }: { offerCount?: number }) {
  const pathname = usePathname()

  const tabs = [
    { name: "Today", href: "/host" },
    { name: "Bookings", href: "/host/bookings" },
    { name: "Offers", href: "/host/offers" },
    { name: "My Tours", href: "/host/tours" },
    { name: "Earnings", href: "/host/earnings" },
    { name: "Calendar", href: "/host/calendar" },
    { name: "Contracts", href: "/host/contracts" },
  ]

  return (
    <div className="bg-white border-b border-zinc-200 shadow-sm w-full">
      <div className="flex px-4 overflow-x-auto max-w-4xl mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.href === "/host" ? pathname === "/host" : pathname === tab.href || pathname.startsWith(`${tab.href}/`)
          return (
            <Link
              key={tab.name}
              href={tab.href}
              prefetch={true}
              className={`whitespace-nowrap py-4 px-6 font-semibold text-sm transition-colors border-b-2 inline-flex items-center gap-2 ${isActive
                  ? "border-black text-black"
                  : "border-transparent text-zinc-500 hover:text-zinc-800"
                }`}
            >
              {tab.name}
              {tab.href === "/host/offers" && offerCount > 0 ? (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#faca20] text-zinc-900 text-[10px] font-black flex items-center justify-center">
                  {offerCount > 9 ? "9+" : offerCount}
                </span>
              ) : null}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
