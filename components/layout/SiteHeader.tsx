"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useHeaderStore } from "@/store/useHeaderStore"
import { useState, useEffect, useLayoutEffect, useRef } from "react"
import {
    consumePageReturn,
    isHomeHeaderSuppressed,
    jumpHomeScroll,
    markHomeArriveTop,
    peekHomeReturnHref,
    rememberPathname,
    revealHomeHeader,
    shouldResetHomeToTop,
    suppressHomeHeader,
} from "@/lib/home-scroll"
import { ArrowLeft, ChevronLeft } from "lucide-react"
import { UserNavMenu } from "@/components/layout/UserNavMenu"
import { publicVertical } from "@/lib/homepage-feed"
import { useHomeBrowseStore } from "@/store/useHomeBrowseStore"

export default function SiteHeader() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const setBrowseVertical = useHomeBrowseStore((s) => s.setVertical)
    const homeVertical = searchParams.get("vertical") || "tour"
    const { useDarkTextDesktop, useDarkTextMobile } = useHeaderStore()

    const [isVisible, setIsVisible] = useState(true)
    const [isScrolled, setIsScrolled] = useState(false)
    const [allowMotion, setAllowMotion] = useState(false)
    const prevPathname = useRef(pathname)
    rememberPathname(pathname)
    const arrivingFromTour = pathname === "/" && prevPathname.current.startsWith("/activity")
    const hideHomeHeader = arrivingFromTour || (pathname === "/" && isHomeHeaderSuppressed() && !shouldResetHomeToTop())

    useLayoutEffect(() => {
        const fromActivity = prevPathname.current.startsWith("/activity")
        prevPathname.current = pathname
        setAllowMotion(false)

        if (pathname !== "/") {
            setIsVisible(true)
            setIsScrolled(false)
            return
        }

        if (shouldResetHomeToTop()) {
            revealHomeHeader()
            jumpHomeScroll(0)
            setIsVisible(true)
            setIsScrolled(false)
            return
        }

        if (fromActivity || isHomeHeaderSuppressed() || window.scrollY > 50) {
            suppressHomeHeader()
            setIsVisible(false)
            setIsScrolled(true)
            return
        }

        setIsVisible(true)
        setIsScrolled(false)
    }, [pathname])

    useEffect(() => {
        if (pathname !== "/") return

        const coarse = window.matchMedia("(pointer: coarse)")

        const onScroll = () => {
            const y = window.scrollY
            setIsScrolled(y > 50 || isHomeHeaderSuppressed())
        }

        const onWheel = (event: WheelEvent) => {
            if (coarse.matches || event.deltaY === 0) return
            const y = window.scrollY
            setIsScrolled(y > 50)
            if (y <= 50) {
                revealHomeHeader()
                setIsVisible(true)
                return
            }
            if (event.deltaY > 0) {
                setIsVisible(false)
                return
            }
            revealHomeHeader()
            setAllowMotion(true)
            setIsVisible(true)
        }

        window.addEventListener("scroll", onScroll, { passive: true })
        window.addEventListener("wheel", onWheel, { passive: true })
        return () => {
            window.removeEventListener("scroll", onScroll)
            window.removeEventListener("wheel", onWheel)
        }
    }, [pathname])

    // Do not render the main site header on host or admin portals
    if (pathname?.startsWith('/host') || pathname?.startsWith('/admin')) {
        return null
    }

    const isHomePage = pathname === '/'
    const isHotelPage = pathname?.startsWith('/hotel')
    const isActivityPage = pathname?.startsWith('/activity') || isHotelPage
    const isDestinationsPage = pathname?.startsWith('/destinations')
    const isTripsPage = pathname?.startsWith('/trips')
    const isTransportPage = pathname?.startsWith('/transport')

    const isMapPage = pathname === '/map'
    const isSupportPage = [
        '/help',
        '/cancellation-policy',
        '/contact',
        '/legal',
        '/list-your-tour',
    ].includes(pathname || '')

    const isStandardPage = !isHomePage && !isActivityPage && !isDestinationsPage && !isTripsPage && !isMapPage && !isTransportPage

    const homeScrolled = isScrolled || hideHomeHeader
    const homeHeaderVisible = isVisible && !hideHomeHeader
    const shouldForceDarkTextDesktop = isHomePage && homeScrolled
    const effectiveDarkTextDesktop = isMapPage ? false : (isActivityPage || isDestinationsPage || isSupportPage || isTripsPage || isTransportPage ? true : (isStandardPage ? true : (shouldForceDarkTextDesktop ? true : useDarkTextDesktop)))
    const effectiveDarkTextMobile = isMapPage ? false : (isActivityPage || isDestinationsPage || isSupportPage || isTripsPage || isTransportPage ? true : (isStandardPage ? true : useDarkTextMobile))

    const textColor = `${effectiveDarkTextMobile ? 'text-slate-700/80' : 'text-white/90'} ${effectiveDarkTextDesktop ? 'md:text-slate-800' : 'md:text-white'}`
    const hoverColor = `${effectiveDarkTextMobile ? 'hover:text-slate-900' : 'hover:text-white'} ${effectiveDarkTextDesktop ? 'md:hover:text-black' : 'md:hover:text-slate-200'}`
    const iconColor = `${effectiveDarkTextMobile ? 'stroke-slate-700/80' : 'stroke-white'} ${effectiveDarkTextDesktop ? 'md:stroke-slate-700/80' : 'md:stroke-white'}`
    const iconBg = `${effectiveDarkTextMobile ? 'bg-black/5' : 'bg-black/20'} ${effectiveDarkTextDesktop ? 'md:bg-black/5' : 'md:bg-white/20'}`
    const iconBorder = `${effectiveDarkTextMobile ? 'border-black/10' : 'border-transparent'} ${effectiveDarkTextDesktop ? 'md:border-black/10' : 'md:border-white/20'}`
    const iconHoverBg = `${effectiveDarkTextMobile ? 'hover:bg-black/10' : 'hover:bg-white/30'} ${effectiveDarkTextDesktop ? 'md:hover:bg-black/10' : 'md:hover:bg-white/30'}`
    const logoFilter = `${effectiveDarkTextMobile ? 'brightness-0 opacity-80' : ''} ${effectiveDarkTextDesktop ? 'md:brightness-0 md:opacity-80' : 'md:brightness-100 md:opacity-100'}`

    const headerClasses = isDestinationsPage || isSupportPage || isTripsPage || isActivityPage || isTransportPage
        ? "sticky top-0 left-0 right-0 z-50 w-full md:py-2 pointer-events-none bg-white/95 backdrop-blur-md shadow-sm"
        : isHomePage
        ? `absolute md:fixed top-0 left-0 right-0 z-50 md:z-50 w-full pointer-events-none ${
            allowMotion && !hideHomeHeader ? "md:transition-transform md:duration-300 md:ease-in-out" : ""
          } ${
            homeScrolled ? 'md:bg-white md:shadow-md md:py-2' : 'md:bg-transparent md:pt-10 md:pb-12'
          } ${
            homeHeaderVisible ? 'md:translate-y-0' : 'md:-translate-y-full md:invisible'
          }`
        : "absolute top-0 left-0 right-0 z-50 md:z-40 w-full md:pt-10 md:pb-12 pointer-events-none"

    return (
        <header className={headerClasses}>
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between pointer-events-auto w-full">
                <div className="flex items-center gap-3">
                    {isActivityPage && (
                        <button
                            type="button"
                            onClick={() => {
                                const from = consumePageReturn()
                                if (from && from.split("?")[0] !== "/") {
                                    router.push(from, { scroll: false })
                                    return
                                }
                                if (isHotelPage) {
                                    markHomeArriveTop()
                                    router.push("/?vertical=hotel", { scroll: false })
                                    return
                                }
                                try {
                                    const dest = sessionStorage.getItem("islandfull:return-dest")
                                    if (dest) {
                                        router.push(`/destinations?dest=${dest}`)
                                        return
                                    }
                                } catch {
                                    // Ignore storage failures and go home.
                                }
                                suppressHomeHeader()
                                router.replace(from || peekHomeReturnHref(), { scroll: false })
                            }}
                            className="flex items-center justify-center -ml-1 p-1 rounded-full hover:bg-black/5 transition-colors"
                            aria-label="Back to previous page"
                        >
                            <ChevronLeft className={`w-6 h-6 ${iconColor}`} />
                        </button>
                    )}
                    {isTripsPage && (
                        <Link
                            href="/"
                            scroll={false}
                            onClick={() => markHomeArriveTop()}
                            className="flex items-center justify-center -ml-1 p-1 rounded-full hover:bg-black/5 active:scale-90 transition-transform cursor-pointer touch-manipulation"
                            aria-label="Back to home"
                        >
                            <ChevronLeft className={`w-6 h-6 ${iconColor}`} />
                        </Link>
                    )}
                    {isDestinationsPage && (
                        <button
                            type="button"
                            onClick={() => {
                                const event = new CustomEvent("islandfull:destinations-back", { cancelable: true })
                                if (!window.dispatchEvent(event)) return
                                markHomeArriveTop()
                                router.push("/", { scroll: false })
                            }}
                            className="md:hidden flex items-center justify-center -ml-1 p-1 rounded-full hover:bg-black/5 active:scale-90 transition-transform cursor-pointer touch-manipulation"
                            aria-label="Go back"
                        >
                            <ChevronLeft className={`w-6 h-6 ${iconColor}`} />
                        </button>
                    )}
                    {pathname === '/map' && (
                        <Link href="/" scroll={false} onClick={() => markHomeArriveTop()} className="md:hidden flex items-center justify-center w-8 h-8 rounded-full bg-black/20 backdrop-blur-md text-white border border-white/20 transition-colors active:bg-black/40 active:scale-90 cursor-pointer touch-manipulation">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    )}
                    <Link
                        href="/"
                        scroll={false}
                        onClick={() => {
                            if (pathname !== "/") markHomeArriveTop()
                        }}
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
                <nav
                    className={`hidden md:flex items-center ${
                        isHomePage && !homeScrolled
                            ? "rounded-full bg-white/90 backdrop-blur-md px-1 py-1 shadow-lg shadow-black/10 text-[13px] font-semibold text-slate-800"
                            : `gap-1 text-sm font-medium ${textColor}`
                    }`}
                >
                    {(
                        [
                            { href: "/?vertical=tour", label: "Tour", vertical: "tour" },
                            { href: "/?vertical=transport", label: "Transport", vertical: "transport" },
                            { href: "/?vertical=hotel", label: "Hotels", vertical: "hotel" },
                            { href: "/destinations", label: "Destinations" },
                            { href: "/trips", label: "Trips" },
                            { href: "/contact", label: "Contact Us" },
                        ] as const
                    ).map((item) => {
                        const isActive =
                            "vertical" in item && item.vertical === "tour"
                                ? (pathname === "/" && homeVertical === "tour") || Boolean(pathname?.startsWith("/activity"))
                                : "vertical" in item && item.vertical === "transport"
                                ? (pathname === "/" && homeVertical === "transport") || Boolean(pathname?.startsWith("/transport"))
                                : "vertical" in item && item.vertical === "hotel"
                                ? (pathname === "/" && homeVertical === "hotel") || Boolean(pathname?.startsWith("/hotel"))
                                : Boolean(pathname?.startsWith(item.href))
                        const overlay = isHomePage && !homeScrolled
                        const activeClass = "bg-[#FFC72C] text-zinc-900 font-bold"

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                scroll={false}
                                onClick={() => {
                                    if ("vertical" in item && item.vertical) {
                                        setBrowseVertical(publicVertical(item.vertical))
                                        if (pathname === "/") {
                                            const y = window.scrollY
                                            jumpHomeScroll(y)
                                            window.setTimeout(() => jumpHomeScroll(y), 50)
                                            return
                                        }
                                        markHomeArriveTop()
                                    }
                                }}
                                className={
                                    overlay
                                        ? `w-[7rem] shrink-0 flex items-center justify-center px-1 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                                              isActive ? activeClass : "hover:bg-zinc-100"
                                          }`
                                        : `w-[7rem] shrink-0 flex items-center justify-center px-1 py-1.5 rounded-full whitespace-nowrap transition-colors ${
                                              isActive ? activeClass : hoverColor
                                          }`
                                }
                            >
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="flex items-center gap-4 ">
                    {pathname === '/map' ? (
                        <Link href="/" className="hidden md:flex items-center gap-1.5 px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                    ) : (
                        <Link href="/map" className="hidden md:flex items-center gap-1.5 px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20">
                            🌍 Explore Map
                        </Link>
                    )}
                    <UserNavMenu
                        triggerClassName={`w-8 h-8 md:w-10 md:h-10 ${iconBg} backdrop-blur-md rounded-full flex items-center justify-center cursor-pointer ${iconHoverBg} transition-colors ${iconBorder}`}
                        iconClassName={`w-4 h-4 md:w-5 md:h-5 ${iconColor}`}
                    />
                </div>
            </div>
        </header>
    )
}
