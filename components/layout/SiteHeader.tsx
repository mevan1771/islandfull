"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { ArrowLeft } from "lucide-react"

export default function SiteHeader() {
  const pathname = usePathname()

  // Do not render the main site header on host or admin portals
  if (pathname?.startsWith('/host') || pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-40 w-full pt-4 md:pt-10 pb-12 pointer-events-none">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2">
          {pathname === '/map' && (
            <Link href="/" className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 transition-colors active:bg-black/40">
              <ArrowLeft className="w-4 h-4" />
            </Link>
          )}
          <Link href="/" className={`flex items-center ${pathname?.startsWith('/activity') ? 'hidden md:flex' : ''}`}>
            <Image
              src="/logo.png"
              alt="IslandFull"
              width={140}
              height={40}
              className="h-10 w-auto object-contain drop-shadow-lg"
              priority
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/90 drop-shadow-md">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/destinations" className="hover:text-white transition-colors">Destinations</Link>
          <Link href="/trips" className="hover:text-white transition-colors">Trips</Link>
          <Link href="/about-us" className="hover:text-white transition-colors">About Us</Link>
        </nav>

        <div className="flex items-center gap-4">
          {pathname === '/map' ? (
            <Link href="/" className="hidden md:flex items-center gap-1.5 px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          ) : (
            <Link href="/map" className="hidden md:flex items-center gap-1.5 px-6 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              🌍 Explore Map
            </Link>
          )}
          <div className={`w-8 h-8 md:w-10 md:h-10 bg-black/20 md:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer md:hover:bg-white/30 transition-colors border-transparent md:border-white/20 ${pathname?.startsWith('/activity') ? 'hidden md:flex' : ''}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 md:w-5 md:h-5">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  )
}
