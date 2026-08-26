"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SpotlightConfig } from '@/components/admin/SpotlightClient'

interface SpotlightCarouselProps {
  slides: SpotlightConfig[]
}

export function SpotlightCarousel({ slides }: SpotlightCarouselProps) {
  const searchParams = useSearchParams()
  const searchLocation = searchParams.get('location')?.toLowerCase()
  const searchCategory = searchParams.get('category')

  const filteredSlides = React.useMemo(() => {
    if (!searchLocation && (!searchCategory || searchCategory === 'all' || searchCategory === 'saved')) {
      // Default behavior: show slides with no specific location/category, capped at 3
      const defaults = slides.filter(s => !s.location && (!s.category_tags || s.category_tags.length === 0)).slice(0, 3)
      return defaults.length > 0 ? defaults : slides.slice(0, 3)
    }

    const matches = slides.filter(slide => {
      const matchesLocation = searchLocation && slide.location?.toLowerCase().includes(searchLocation)
      const matchesCategory = searchCategory && slide.category_tags?.includes(searchCategory)
      return matchesLocation || matchesCategory
    })

    if (matches.length > 0) return matches

    // Fallback to defaults if no match found, capped at 3
    const defaults = slides.filter(s => !s.location && (!s.category_tags || s.category_tags.length === 0)).slice(0, 3)
    return defaults.length > 0 ? defaults : slides.slice(0, 3)
  }, [slides, searchLocation, searchCategory])

  const [selectedIndex, setSelectedIndex] = useState(0)
  const scrollContainerRef = React.useRef<HTMLDivElement>(null)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleScroll = React.useCallback(() => {
    if (!scrollContainerRef.current) return
    const scrollLeft = scrollContainerRef.current.scrollLeft
    const width = scrollContainerRef.current.clientWidth
    const index = Math.round(scrollLeft / width)
    if (index !== selectedIndex) {
      setSelectedIndex(index)
    }
  }, [selectedIndex])

  React.useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    let timeoutId: NodeJS.Timeout
    const onScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 50) // 50ms debounce
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', onScroll)
      clearTimeout(timeoutId)
    }
  }, [handleScroll])

  const scrollTo = (index: number) => {
    if (!scrollContainerRef.current) return
    const width = scrollContainerRef.current.clientWidth
    scrollContainerRef.current.scrollTo({
      left: width * index,
      behavior: 'smooth'
    })
    setSelectedIndex(index)
  }

  // Reset index when filtered slides change
  React.useEffect(() => {
    setSelectedIndex(0)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }, [filteredSlides])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = 'grabbing'
    scrollContainerRef.current.style.scrollSnapType = 'none'
    scrollContainerRef.current.style.scrollBehavior = 'auto'
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
      scrollContainerRef.current.style.scrollSnapType = 'x mandatory'
      scrollContainerRef.current.style.scrollBehavior = 'smooth'
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
      scrollContainerRef.current.style.scrollSnapType = 'x mandatory'
      scrollContainerRef.current.style.scrollBehavior = 'smooth'
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <section className="bg-zinc-50 py-4 md:py-24 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] cursor-grab active:cursor-grabbing"
        >
          {filteredSlides.map((slide, index) => (
            <div
              key={slide.id || index}
              className="flex-[0_0_100%] min-w-0 snap-center shrink-0"
            >
              <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center w-full py-8 md:py-12">
                {/* Text Content */}
                <div className="space-y-4 md:space-y-6 px-1 pb-6">
                  <div className="flex flex-row md:flex-col items-center md:items-start gap-2 md:gap-0 max-w-full overflow-hidden w-full">
                    {(slide.badge_text || slide.location) && (
                      <div className="shrink-0 inline-block bg-rose-500 text-white text-[10px] md:text-xs uppercase font-bold px-2.5 py-1 md:px-3 md:py-1 rounded-full shadow-sm tracking-wider md:mb-2">
                        {slide.badge_text || slide.location}
                      </div>
                    )}
                    <h2
                      className="flex-1 min-w-0 text-[clamp(0.875rem,calc(120vw/var(--char-count)),1.125rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold text-slate-700/80"
                      style={{ '--char-count': slide.title.length } as React.CSSProperties}
                    >
                      {slide.title}
                    </h2>
                  </div>
                  <p className="text-slate-600/80 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                    {slide.description.replace(/<[^>]*>?/gm, '')}
                  </p>

                  {/* Desktop Button */}
                  <div className="hidden md:block">
                    {slide.target_url ? (
                      <Link href={slide.target_url}>
                        <button className="mt-5 bg-rose-500 hover:bg-rose-600 text-white px-7 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm hover:shadow">
                          {slide.button_text ? slide.button_text : 'Find More'}
                        </button>
                      </Link>
                    ) : (
                      <button className="mt-5 bg-rose-500 hover:bg-rose-600 text-white px-7 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm hover:shadow">
                        {slide.button_text ? slide.button_text : 'Find More'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Images */}
                <div className="grid grid-cols-2 gap-3 md:gap-5 px-1 w-full md:max-w-lg lg:max-w-xl md:ml-auto">
                  <div className="relative w-full h-48 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg translate-y-4 md:translate-y-8 aspect-auto pointer-events-none transform-gpu">
                    <Image src={slide.image_url_1} alt="Spotlight Image 1" fill quality={95} sizes="(max-width: 768px) 50vw, 33vw" priority={index === 0} unoptimized={true} className="object-cover rounded-2xl md:rounded-3xl" />
                  </div>
                  <div className="relative w-full h-48 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg -translate-y-4 md:-translate-y-8 aspect-auto pointer-events-none transform-gpu">
                    <Image src={slide.image_url_2} alt="Spotlight Image 2" fill quality={95} sizes="(max-width: 768px) 50vw, 33vw" priority={index === 0} unoptimized={true} className="object-cover rounded-2xl md:rounded-3xl" />
                  </div>
                </div>

                {/* Mobile Button */}
                <div className="md:hidden flex justify-center mt-6 px-1">
                  {slide.target_url ? (
                    <Link href={slide.target_url}>
                      <button className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-full font-medium text-sm transition-all shadow-sm hover:shadow">
                        {slide.button_text ? slide.button_text : 'Find More'}
                      </button>
                    </Link>
                  ) : (
                    <button className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-full font-medium text-sm transition-all shadow-sm hover:shadow">
                      {slide.button_text ? slide.button_text : 'Find More'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        {filteredSlides.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-2 md:mt-4 relative z-10">
            {filteredSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`transition-all duration-300 ease-out rounded-full ${index === selectedIndex
                  ? "w-6 h-2.5 bg-rose-500 shadow-sm"
                  : "w-2.5 h-2.5 bg-zinc-300 hover:bg-zinc-400"
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
