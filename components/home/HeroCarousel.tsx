"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { HeaderThemeSetter } from "@/components/layout/HeaderThemeSetter"
import { heroDefaultSrc, heroLqip, heroSrcSet, HERO_SIZES } from "@/lib/hero-media"
import { formatUSD } from "@/lib/utils"
import { getLowestPerPersonFromTiers, hasPricingTiers } from "@/lib/pricingTiers"

export interface Tour {
    id: string
    title: string
    subtitle?: string
    slug: string
    location?: string
    cover_image_url?: string
    card_image_url?: string
    isStatic?: boolean
    use_dark_text_desktop?: boolean
    use_dark_text_mobile?: boolean
    price_usd?: number
    price_suffix?: string | null
    discount_price?: number | null
    deal_end_date?: string | null
    pricing_model?: string
    pricing_tiers?: unknown
}

const THEME_DELAY_MS = 350
const LOAD_WAIT_MS = 1200

function heroPriceLabel(tour: Tour): string | null {
    if (tour.isStatic) return null
    const priceUsd = tour.price_usd
    if (priceUsd == null) return null
    if (priceUsd === 0) return "Free"

    const isDealActive = Boolean(tour.discount_price && tour.deal_end_date && new Date(tour.deal_end_date) > new Date())
    const hasGroupTiers = hasPricingTiers(tour.pricing_tiers)
    const lowestPerPerson = hasGroupTiers ? getLowestPerPersonFromTiers(tour.pricing_tiers) : null

    if (isDealActive && tour.discount_price) return formatUSD(tour.discount_price)
    if (hasGroupTiers && lowestPerPerson != null) return formatUSD(lowestPerPerson)
    return formatUSD(priceUsd)
}

function slideImageUrl(tour: Tour) {
    return tour.cover_image_url || tour.card_image_url || ""
}

function TitleBlock({ tour }: { tour: Tour }) {
    const chip =
        "inline-flex items-center text-[10px] md:text-sm font-bold px-2.5 md:px-6 py-1 md:py-2.5 rounded-full shadow-sm md:shadow-lg leading-none"
    const location = tour.isStatic ? "Sri Lanka" : tour.location?.replace(", Sri Lanka", "")
    const priceLabel = heroPriceLabel(tour)

    const badges = (
        <div className="flex flex-nowrap items-center gap-1.5 md:gap-2 max-w-full">
            {location && (
                <span className={`${chip} shrink-0 bg-rose-500 text-white uppercase tracking-wider`}>
                    {location}
                </span>
            )}
            {tour.title && (
                <h1 className={`${chip} min-w-0 max-w-full gap-2 md:gap-3 bg-white`}>
                    <span className="min-w-0 truncate text-zinc-900">{tour.title}</span>
                    {priceLabel && (
                        <>
                            <span className="h-3 md:h-3.5 w-px shrink-0 bg-zinc-200" aria-hidden="true" />
                            <span className="shrink-0 text-rose-500 tabular-nums tracking-tight">
                                {priceLabel}
                            </span>
                        </>
                    )}
                </h1>
            )}
        </div>
    )

    if (tour.isStatic) {
        return (
            <div className="flex flex-col items-start text-left gap-1.5 pointer-events-auto w-full pb-1 md:pb-6">
                {badges}
                {tour.subtitle && (
                    <p className="text-[10px] md:text-xs font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] max-w-xl">
                        {tour.subtitle}
                    </p>
                )}
            </div>
        )
    }

    return (
        <Link
            href={`/activity/${tour.slug}`}
            className="flex flex-col items-start text-left cursor-pointer hover:opacity-90 transition-opacity pointer-events-auto w-full pb-1 md:pb-6"
        >
            {badges}
        </Link>
    )
}

export function HeroCarousel({ carouselSlides }: { carouselSlides: Tour[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [themeIndex, setThemeIndex] = useState(0)
    const [loaded, setLoaded] = useState<Record<number, boolean>>({ 0: true })
    const [pendingIndex, setPendingIndex] = useState<number | null>(null)

    const themeTour = carouselSlides[themeIndex] ?? carouselSlides[0]
    const useDarkTextDesktop = themeTour?.use_dark_text_desktop || false
    const useDarkTextMobile = themeTour?.use_dark_text_mobile || false

    useEffect(() => {
        if (carouselSlides.length <= 1) return

        const waitTime = currentIndex === 0 ? 5000 : 6000
        const timeout = setTimeout(() => {
            setPendingIndex((currentIndex + 1) % carouselSlides.length)
        }, waitTime)

        return () => clearTimeout(timeout)
    }, [carouselSlides.length, currentIndex])

    useEffect(() => {
        if (pendingIndex === null) return

        if (loaded[pendingIndex]) {
            setCurrentIndex(pendingIndex)
            setPendingIndex(null)
            return
        }

        const fallback = setTimeout(() => {
            setCurrentIndex(pendingIndex)
            setPendingIndex(null)
        }, LOAD_WAIT_MS)

        return () => clearTimeout(fallback)
    }, [pendingIndex, loaded])

    useEffect(() => {
        const timeout = setTimeout(() => setThemeIndex(currentIndex), THEME_DELAY_MS)
        return () => clearTimeout(timeout)
    }, [currentIndex])

    return (
        <section className="relative pt-24 md:pt-32 pb-16 md:pb-28 text-white h-[clamp(20rem,48svh,24rem)] md:h-[90vh] flex flex-col justify-center overflow-hidden rounded-b-xl md:rounded-none bg-slate-900">
            <HeaderThemeSetter useDarkTextDesktop={useDarkTextDesktop} useDarkTextMobile={useDarkTextMobile} />

            {carouselSlides.map((tour, index) => {
                const rawUrl = slideImageUrl(tour)
                const isActive = index === currentIndex
                const shouldLoadEager = index === 0 || index === currentIndex || index === (currentIndex + 1) % carouselSlides.length
                const lqip = heroLqip(rawUrl)

                return (
                    <div
                        key={tour.id}
                        className={`absolute inset-0 transition-opacity ease-in-out duration-700 ${
                            isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                        }`}
                        aria-hidden={!isActive}
                    >
                        <img
                            src={heroDefaultSrc(rawUrl)}
                            srcSet={heroSrcSet(rawUrl)}
                            sizes={HERO_SIZES}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover"
                            style={lqip ? { backgroundImage: `url(${lqip})`, backgroundSize: "cover" } : undefined}
                            fetchPriority={index === 0 ? "high" : "auto"}
                            decoding="async"
                            loading={shouldLoadEager ? "eager" : "lazy"}
                            onLoad={() => setLoaded((prev) => (prev[index] ? prev : { ...prev, [index]: true }))}
                        />
                    </div>
                )
            })}

            <div className="absolute inset-x-0 bottom-0 z-[15] h-[38%] md:h-[42%] bg-gradient-to-t from-black/55 via-black/15 to-transparent pointer-events-none" />

            <div className="absolute bottom-10 md:bottom-14 lg:bottom-16 w-full left-0 right-0 z-20 pointer-events-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="relative min-h-[2.75rem] md:min-h-[3.5rem]">
                        {carouselSlides.map((tour, index) => (
                            <div
                                key={`${tour.id}-copy`}
                                className={`absolute inset-0 flex flex-col justify-end items-start transition-opacity ease-in-out duration-700 ${
                                    index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                                }`}
                                aria-hidden={index !== currentIndex}
                            >
                                <TitleBlock tour={tour} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
