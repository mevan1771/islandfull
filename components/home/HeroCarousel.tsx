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
    const titleClass = `max-w-full text-[clamp(0.7rem,calc(130vw/var(--char-count)),1.125rem)] md:text-[clamp(1.125rem,calc(70vw/var(--char-count)),1.875rem)] whitespace-nowrap overflow-hidden text-ellipsis leading-tight font-bold ${
        tour.use_dark_text_mobile ? "text-slate-700/80" : "text-white"
    } ${tour.use_dark_text_desktop ? "md:text-slate-700/80" : "md:text-white"}`
    const titleStyle = { "--char-count": Math.max(tour.title?.length ?? 1, 1) } as React.CSSProperties

    if (tour.isStatic) {
        return (
            <div className="flex flex-col items-start text-left gap-2 pointer-events-auto w-full pb-6">
                <div className="flex flex-col items-start max-w-full overflow-hidden">
                    <span className="bg-rose-500 text-white text-[10px] md:text-xs uppercase font-bold px-2.5 py-1 rounded-full w-max shadow-sm tracking-wider shrink-0 mb-2">
                        SRI LANKA
                    </span>
                    {tour.title ? (
                        <h1 className={titleClass} style={titleStyle}>
                            {tour.title}
                        </h1>
                    ) : null}
                </div>
                {tour.subtitle && (
                    <p
                        className={`block text-sm sm:text-base md:text-lg font-medium ${
                            tour.use_dark_text_mobile ? "text-slate-600/80" : "text-white/90"
                        } ${tour.use_dark_text_desktop ? "md:text-slate-600/80" : "md:text-white/90"}`}
                    >
                        {tour.subtitle}
                    </p>
                )}
            </div>
        )
    }

    return (
        <Link
            href={`/activity/${tour.slug}`}
            className="flex flex-col items-start text-left cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto w-full pb-6"
        >
            <div className="flex flex-col items-start max-w-full overflow-hidden">
                {tour.location && (
                    <span className="bg-rose-500 text-white text-[10px] md:text-xs uppercase font-bold px-2.5 py-1 rounded-full w-max shadow-sm tracking-wider shrink-0 mb-2">
                        {tour.location.replace(", Sri Lanka", "")}
                    </span>
                )}
                <h1 className={titleClass} style={titleStyle}>
                    {tour.title}
                </h1>
            </div>
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
