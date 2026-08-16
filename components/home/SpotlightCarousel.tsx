"use client"

import React, { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import Image from 'next/image'
import Link from 'next/link'
import { SpotlightConfig } from '@/components/admin/SpotlightClient'

interface SpotlightCarouselProps {
  slides: SpotlightConfig[]
}

export function SpotlightCarousel({ slides }: SpotlightCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: false },
    [Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })]
  )
  const [selectedIndex, setSelectedIndex] = useState(0)

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
            {slides.map((slide, index) => (
              <div
                key={slide.id || index}
                className="flex-[0_0_100%] min-w-0"
              >
                <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center w-full py-8 md:py-12">
                  {/* Text Content */}
                  <div className="space-y-4 md:space-y-6 px-1">
                    <div className="flex flex-col items-start">
                      {slide.badge_text && (
                        <div className="inline-block bg-rose-500 text-white text-[10px] md:text-xs uppercase font-bold px-2 md:px-3 py-1 rounded-full shadow-sm tracking-wider mb-2">
                          {slide.badge_text}
                        </div>
                      )}
                      <h2 className="text-[clamp(1.2rem,5vw,2.5rem)] leading-tight font-bold text-zinc-900 line-clamp-2">
                        {slide.title}
                      </h2>
                    </div>
                    <p className="text-zinc-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl line-clamp-4">
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
                      <Image src={slide.image_url_1} alt="Spotlight Image 1" fill quality={90} sizes="(max-width: 768px) 50vw, 25vw" className="object-cover rounded-2xl md:rounded-3xl" />
                    </div>
                    <div className="relative w-full h-48 md:h-80 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg -translate-y-4 md:-translate-y-8 aspect-auto pointer-events-none transform-gpu">
                      <Image src={slide.image_url_2} alt="Spotlight Image 2" fill quality={90} sizes="(max-width: 768px) 50vw, 25vw" className="object-cover rounded-2xl md:rounded-3xl" />
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
        {slides.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-2 md:mt-4 relative z-10">
            {slides.map((_, index) => (
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
