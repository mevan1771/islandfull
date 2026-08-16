"use client"

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
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
      // Default behavior: show slides with no specific location/category
      const defaults = slides.filter(s => !s.location && (!s.category_tags || s.category_tags.length === 0))
      return defaults.length > 0 ? defaults : slides
    }

    const matches = slides.filter(slide => {
      const matchesLocation = searchLocation && slide.location?.toLowerCase().includes(searchLocation)
      const matchesCategory = searchCategory && slide.category_tags?.includes(searchCategory)
      return matchesLocation || matchesCategory
    })

    if (matches.length > 0) return matches

    // Fallback to defaults if no match found
    const defaults = slides.filter(s => !s.location && (!s.category_tags || s.category_tags.length === 0))
    return defaults.length > 0 ? defaults : slides
  }, [slides, searchLocation, searchCategory])

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Reset index when filtered slides change
  useEffect(() => {
    setSelectedIndex(0)
    if (emblaApi) emblaApi.scrollTo(0)
  }, [filteredSlides, emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    onSelect()
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
  }, [emblaApi, onSelect])

  return (
    <section className="bg-zinc-50 py-10 md:py-24 relative overflow-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
          <div className="flex touch-pan-y">
            {filteredSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                className="flex-[0_0_100%] min-w-0"
              >
                <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center w-full py-8 md:py-12">
                  {/* Text Content */}
                  <div className="space-y-4 md:space-y-6 px-1 pb-6">
                    <div className="flex flex-col items-start max-w-full overflow-hidden">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {(slide.badge_text || slide.location) && (
                          <div className="inline-block bg-rose-500 text-white text-[10px] md:text-xs uppercase font-bold px-2.5 py-1 rounded-full shadow-sm tracking-wider">
                            {slide.badge_text || slide.location}
                          </div>
                        )}
                        {slide.category_tags && slide.category_tags.length > 0 && slide.category_tags.map(tag => (
                          <div key={tag} className="inline-block bg-zinc-200 text-zinc-700 text-[10px] md:text-xs font-semibold px-2 py-1 rounded-full shadow-sm capitalize">
                            {tag.replace(/-/g, ' ')}
                          </div>
                        ))}
                      </div>
                      <h2
                        className="text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold text-zinc-900"
                        style={{ '--char-count': slide.title.length } as React.CSSProperties}
                      >
                        {slide.title}
                      </h2>
                    </div>
                    <p className="text-zinc-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
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
                      <Image src={slide.image_url_1} alt="Spotlight Image 1" fill quality={100} sizes="100vw" priority={true} unoptimized={true} className="object-cover rounded-2xl md:rounded-3xl" />
                    </div>
                    <div className="relative w-full h-48 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg -translate-y-4 md:-translate-y-8 aspect-auto pointer-events-none transform-gpu">
                      <Image src={slide.image_url_2} alt="Spotlight Image 2" fill quality={100} sizes="100vw" priority={true} unoptimized={true} className="object-cover rounded-2xl md:rounded-3xl" />
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
        </div>

        {/* Pagination Dots */}
        {filteredSlides.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-2 md:mt-4 relative z-10">
            {filteredSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
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
