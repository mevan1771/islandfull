"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useHeaderStore } from "@/store/useHeaderStore"

import { ArrowLeft } from "lucide-react"

export default function SiteHeader() {
    const pathname = usePathname()
    const router = useRouter()
    const { useDarkTextDesktop, useDarkTextMobile } = useHeaderStore()

    // Do not render the main site header on host, admin, or activity portals
    if (pathname?.startsWith('/host') || pathname?.startsWith('/admin') || pathname?.startsWith('/activity')) {
        return null
    }

    const textColor = `${useDarkTextMobile ? 'text-slate-700/80' : 'text-white/90'} ${useDarkTextDesktop ? 'md:text-slate-700/80' : 'md:text-white/90'}`
    const hoverColor = `${useDarkTextMobile ? 'hover:text-slate-900' : 'hover:text-white'} ${useDarkTextDesktop ? 'md:hover:text-slate-900' : 'md:hover:text-white'}`
    const iconColor = `${useDarkTextMobile ? 'stroke-slate-700/80' : 'stroke-white'} ${useDarkTextDesktop ? 'md:stroke-slate-700/80' : 'md:stroke-white'}`
    const iconBg = `${useDarkTextMobile ? 'bg-black/5' : 'bg-black/20'} ${useDarkTextDesktop ? 'md:bg-black/5' : 'md:bg-white/20'}`
    const iconBorder = `${useDarkTextMobile ? 'border-black/10' : 'border-transparent'} ${useDarkTextDesktop ? 'md:border-black/10' : 'md:border-white/20'}`
    const iconHoverBg = `${useDarkTextMobile ? 'hover:bg-black/10' : 'hover:bg-white/30'} ${useDarkTextDesktop ? 'md:hover:bg-black/10' : 'md:hover:bg-white/30'}`
    const logoFilter = `${useDarkTextMobile ? 'brightness-0 opacity-80' : ''} ${useDarkTextDesktop ? 'md:brightness-0 md:opacity-80' : 'md:brightness-100 md:opacity-100'}`

    return (
        <header className="absolute top-0 left-0 right-0 z-40 w-full pt-4 md:pt-10 pb-12 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between pointer-events-auto">
                <div className="flex items-center gap-2">
                    {pathname === '/map' && (
                        <Link href="/" className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 transition-colors active:bg-black/40">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    )}
                    <Link
                        href="/"
                        className={`flex items-center ${pathname?.startsWith('/activity') ? 'hidden md:flex' : ''} cursor-pointer`}
                    >
                        <Image
                            src="/logo.png"
                            alt="IslandFull"
                            width={140}
                            height={40}
                            className={`h-10 w-auto object-contain ${logoFilter}`}
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
                    <div className={`w-8 h-8 md:w-10 md:h-10 ${iconBg} backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer ${iconHoverBg} transition-colors ${iconBorder} ${pathname?.startsWith('/activity') ? 'hidden md:flex' : ''}`}>
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
