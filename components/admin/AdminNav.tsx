'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  const links = [
    { name: 'Bookings', href: '/admin' },
    { name: 'Tours', href: '/admin/tours' },
    { name: 'Events', href: '/admin/events' },
    { name: 'Transport', href: '/admin/transport' },
    { name: 'Hero Carousel', href: '/admin/carousel' },
    { name: 'Spotlight', href: '/admin/spotlight' },
    { name: 'Reviews', href: '/admin/reviews' },
    { name: 'Promo Codes', href: '/admin/promos', adminOnly: true },
    { name: 'Partner Ledger', href: '/admin/ledger', adminOnly: true },
    { name: 'Finances', href: '/admin/finances', adminOnly: true },
    { name: 'Earnings', href: '/admin/earnings', adminOnly: true },
    { name: 'Hosts', href: '/admin/hosts' },
    { name: 'Partners', href: '/admin/partners', adminOnly: true },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Team / Access Control', href: '/admin/team', adminOnly: true },
    { name: 'Global Settings', href: '/admin/settings', adminOnly: true },
    { name: 'Policies & Contracts', href: '/admin/policies', adminOnly: true },
  ]

  return (
    <div className="flex gap-6 border-b border-zinc-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
      {links.map((link) => {
        if (link.adminOnly && !isAdmin) return null

        const isActive = pathname === link.href

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`pb-3 border-b-2 px-1 transition-colors ${isActive
              ? 'border-zinc-900 font-bold text-zinc-900'
              : 'border-transparent font-bold text-zinc-500 hover:text-zinc-900'
              }`}
          >
            {link.name}
          </Link>
        )
      })}
    </div>
  )
}
