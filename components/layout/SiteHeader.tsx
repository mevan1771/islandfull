"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useHeaderStore } from "@/store/useHeaderStore"

import { ArrowLeft, ChevronLeft } from "lucide-react"

export default function SiteHeader() {
    const pathname = usePathname()
    const router = useRouter()
    const { useDarkTextDesktop, useDarkTextMobile } = useHeaderStore()

    // Do not render the main site header on host or admin portals
    if (pathname?.startsWith('/host') || pathname?.startsWith('/admin')) {
        return null
    }

    const isHomePage = pathname === '/'
    const isActivityPage = pathname?.startsWith('/activity')
    const isDestinationsPage = pathname?.startsWith('/destinations')
    const isTripsPage = pathname?.startsWith('/trips')

    // If it's a standard page (not home, activity, destinations, trips), default to dark text
    const isStandardPage = !isHomePage && !isActivityPage && !isDestinationsPage && !isTripsPage

    const effectiveDarkTextDesktop = isStandardPage ? true : useDarkTextDesktop
    const effectiveDarkTextMobile = isActivityPage ? true : (isStandardPage ? true : useDarkTextMobile)

    const textColor = `${effectiveDarkTextMobile ? 'text-slate-700/80' : 'text-white/90'} ${effectiveDarkTextDesktop ? 'md:text-slate-700/80' : 'md:text-white/90'}`
    const hoverColor = `${effectiveDarkTextMobile ? 'hover:text-slate-900' : 'hover:text-white'} ${effectiveDarkTextDesktop ? 'md:hover:text-slate-900' : 'md:hover:text-white'}`
    const iconColor = `${effectiveDarkTextMobile ? 'stroke-slate-700/80' : 'stroke-white'} ${effectiveDarkTextDesktop ? 'md:stroke-slate-700/80' : 'md:stroke-white'}`
    const iconBg = `${effectiveDarkTextMobile ? 'bg-black/5' : 'bg-black/20'} ${effectiveDarkTextDesktop ? 'md:bg-black/5' : 'md:bg-white/20'}`
    const iconBorder = `${effectiveDarkTextMobile ? 'border-black/10' : 'border-transparent'} ${effectiveDarkTextDesktop ? 'md:border-black/10' : 'md:border-white/20'}`
    const iconHoverBg = `${effectiveDarkTextMobile ? 'hover:bg-black/10' : 'hover:bg-white/30'} ${effectiveDarkTextDesktop ? 'md:hover:bg-black/10' : 'md:hover:bg-white/30'}`
    const logoFilter = `${effectiveDarkTextMobile ? 'brightness-0 opacity-80' : ''} ${effectiveDarkTextDesktop ? 'md:brightness-0 md:opacity-80' : 'md:brightness-100 md:opacity-100'}`

    const headerClasses = isActivityPage
        ? "relative md:absolute top-0 left-0 right-0 z-50 md:z-40 w-full md:pt-10 md:pb-12 pointer-events-none bg-transparent"
        : "absolute top-0 left-0 right-0 z-50 md:z-40 w-full md:pt-10 md:pb-12 pointer-events-none"

    return (
        <header className={headerClasses}>
            <div className="max-w-7xl mx-auto px-4 h-12 md:h-16 flex items-center justify-between pointer-events-auto w-full">
                <div className="flex items-center gap-3">
                    {isActivityPage && (
                        <button
                            onClick={() => router.back()}
                            className="md:hidden flex items-center justify-center"
                            aria-label="Go back"
                        >
                            <ChevronLeft className={`w-6 h-6 ${iconColor}`} />
                        </button>
                    )}
                    {pathname === '/map' && (
                        <Link href="/" className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 transition-colors active:bg-black/40">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    )}
                    <Link
                        href="/"
                        className={`flex items-center cursor-pointer`}
                    >
                        <Image
                            src={effectiveDarkTextMobile ? '/logo_dark.png' : '/logo_light.png'}
                            alt="IslandFull"
                            width={140}
                            height={40}
                            className={`block md:hidden h-6 w-auto object-contain`}
                            priority
                        />
                        <Image
                            src={effectiveDarkTextDesktop ? '/logo_dark.png' : '/logo_light.png'}
                            alt="IslandFull"
                            width={140}
                            height={40}
                            className={`hidden md:block h-9 w-auto object-contain`}
                            priority
                        />
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${textColor}`}>
                    <Link
                        href="/"
                        className={`${hoverColor} transition-colors cursor-pointer`}
                    >
                        Home
                    </Link>
                    <Link href="/destinations" className={`${hoverColor} transition-colors`}>Destinations</Link>
                    <Link href="/trips" className={`${hoverColor} transition-colors`}>Trips</Link>
                    <Link href="/about-us" className={`${hoverColor} transition-colors`}>About Us</Link>
                </nav>

                <div className="flex items-center gap-4 ">
                    {pathname === '/map' ? (
                        <Link href="/" className="hidden md:flex items-center gap-1.5 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                    ) : (
                        <Link href="/map" className="hidden md:flex items-center gap-1.5 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20">
                            🌍 Explore Map
                        </Link>
                    )}
                    <div className={`w-8 h-8 md:w-10 md:h-10 ${iconBg} backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer ${iconHoverBg} transition-colors ${iconBorder}`}>
                        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 md:w-5 md:h-5 ${iconColor}`}>
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </div>
                </div>
            </div>
        </header>
    )
}
