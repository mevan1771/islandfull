"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

interface Tour {
  id: string
  title: string
  subtitle?: string
  slug: string
  location?: string
  cover_image_url?: string
  card_image_url?: string
  isStatic?: boolean
}

export function HeroCarousel({ tours, introSlide }: { tours: Tour[], introSlide?: any }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})

  // Merge dynamic intro slide with fetched tours
  const carouselSlides: Tour[] = [
    {
      id: 'static-intro',
      title: introSlide?.title || 'Your Journey in Sri Lanka Begins Here',
      subtitle: introSlide?.subtitle || 'Inspiration, planning, and booking—all in one place.',
      slug: '',
      cover_image_url: introSlide?.cover_image_url || 'https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      isStatic: true
    },
    ...tours
  ]

  useEffect(() => {
    if (carouselSlides.length <= 1) return;

    const waitTime = currentIndex === 0 ? 5000 : 6000;

    const timeout = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselSlides.length)
    }, waitTime);

    return () => clearTimeout(timeout)
  }, [carouselSlides.length, currentIndex])

  const upgradeUnsplashUrl = (url: string) => {
    if (!url) return "";
    if (url.includes('images.unsplash.com')) {
      try {
        const urlObj = new URL(url);
        urlObj.searchParams.set('w', '2500');
        urlObj.searchParams.set('q', '90');
        return urlObj.toString();
      } catch (e) {
        return url;
      }
    }
    return url;
  }

  return (
    <section className="relative pt-24 md:pt-32 pb-40 md:pb-48 text-white min-h-[50svh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden rounded-b-xl md:rounded-none bg-zinc-900 animate-in fade-in duration-700 ease-in-out">
      {/* Slides */}
      {carouselSlides.map((tour, index) => (
        <div
          key={tour.id}
          className={`absolute inset-0 ease-in-out ${index === currentIndex
            ? 'opacity-100 z-20 transition-opacity duration-[1200ms]'
            : 'opacity-0 z-10 pointer-events-none transition-opacity duration-[1200ms] delay-[1200ms]'
            }`}
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        >
          <Image
            src={upgradeUnsplashUrl(tour.cover_image_url || tour.card_image_url || "")}
            alt={tour.title}
            fill
            className={`object-cover transition-opacity duration-700 ease-in-out ${loadedImages[tour.id] ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoadedImages(prev => ({ ...prev, [tour.id]: true }))}
            priority={index === 0}
            quality={95}
            sizes="100vw"
            unoptimized={true}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
          />

          {/* Slide-specific Legibility Mask */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10"></div>

          {/* Slide Content */}
          <div className="absolute bottom-8 md:bottom-20 lg:bottom-24 w-full left-0 right-0 z-10 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex flex-col justify-end items-start min-h-[120px] md:min-h-[160px]">
                {tour.isStatic ? (
                  <div className="flex flex-col items-start text-left gap-2 pointer-events-auto w-full pb-6">
                    <div className="flex flex-col items-start max-w-full overflow-hidden">
                      <span className="bg-rose-500 text-white text-[10px] md:text-xs uppercase font-bold px-2.5 py-1 rounded-full w-max shadow-sm tracking-wider shrink-0 mb-2">
                        SRI LANKA
                      </span>
                      <h1
                        className="text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold text-white drop-shadow-md"
                        style={{ '--char-count': tour.title.length } as React.CSSProperties}
                      >
                        {tour.title}
                      </h1>
                    </div>
                    {tour.subtitle && (
                      <p className="block md:block text-sm sm:text-base md:text-lg font-medium drop-shadow-md text-white/90">
                        {tour.subtitle}
                      </p>
                    )}
                  </div>
                ) : (
                  <Link
                    href={`/activity/${tour.slug}`}
                    className="flex flex-col items-start text-left cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto w-full pb-6"
                  >
                    <div className="flex flex-col items-start max-w-full overflow-hidden">
                      {tour.location && (
                        <span className="bg-rose-500 text-white text-[10px] md:text-xs uppercase font-bold px-2.5 py-1 rounded-full w-max shadow-sm tracking-wider shrink-0 mb-2">
                          {tour.location.replace(', Sri Lanka', '')}
                        </span>
                      )}
                      <h1
                        className="text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold text-white drop-shadow-md"
                        style={{ '--char-count': tour.title.length } as React.CSSProperties}
                      >
                        {tour.title}
                      </h1>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

    </section>
  )
}
