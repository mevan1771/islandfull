"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { HeaderThemeSetter } from "@/components/layout/HeaderThemeSetter"
import { heroDefaultSrc, heroLqip, heroSrcSet, HERO_SIZES } from "@/lib/hero-media"

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
}

const THEME_DELAY_MS = 350
const LOAD_WAIT_MS = 1200

function slideImageUrl(tour: Tour) {
    return tour.cover_image_url || tour.card_image_url || ""
}

function TitleBlock({ tour }: { tour: Tour }) {
    const chip = "text-[10px] md:text-sm font-bold px-2.5 md:px-6 py-1 md:py-2.5 rounded-full shadow-sm md:shadow-lg leading-none"
    const title = tour.title ? (
        <h1 className={`${chip} max-w-full min-w-0 bg-white text-zinc-900 whitespace-nowrap overflow-hidden text-ellipsis`}>
            {tour.title}
        </h1>
    ) : null

    const badges = (
        <div className="flex flex-wrap items-center gap-1.5 md:gap-2 max-w-full">
            {tour.isStatic ? (
                <span className={`${chip} bg-rose-500 text-white uppercase tracking-wider`}>SRI LANKA</span>
            ) : tour.location ? (
                <span className={`${chip} bg-rose-500 text-white uppercase tracking-wider`}>
                    {tour.location.replace(", Sri Lanka", "")}
                </span>
            ) : null}
            {title}
        </div>
    )

    if (tour.isStatic) {
        return (
            <div className="flex flex-col items-start text-left gap-1.5 pointer-events-auto w-full pb-6">
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
            className="flex flex-col items-start text-left cursor-pointer hover:opacity-90 transition-opacity pointer-events-auto w-full pb-6"
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
        <section className="relative pt-24 md:pt-32 pb-16 md:pb-48 text-white h-[clamp(15rem,36svh,18.25rem)] md:h-[85vh] flex flex-col justify-center overflow-hidden rounded-b-xl md:rounded-none bg-slate-900">
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

            <div className="absolute bottom-5 md:bottom-20 lg:bottom-24 w-full left-0 right-0 z-20 pointer-events-none">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="relative min-h-[5.5rem] md:min-h-[160px]">
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
