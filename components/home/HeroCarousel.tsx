"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

interface Tour {
  id: string
  title: string
  slug: string
  location?: string
  cover_image_url?: string
  card_image_url?: string
}

export function HeroCarousel({ tours }: { tours: Tour[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (tours.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % tours.length)
    }, 6000); // 6 seconds per slide
    
    return () => clearInterval(interval)
  }, [tours.length])

  // Fallback if no tours
  if (!tours || tours.length === 0) {
    return (
      <section className="relative pt-24 md:pt-32 pb-40 md:pb-48 text-white min-h-[50vh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden rounded-b-xl md:rounded-none">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Sri Lanka Coast" 
            fill 
            className="object-cover"
            priority={true}
            quality={90}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          />
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/70 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-16 md:bottom-24 w-full left-0 right-0 z-10 pointer-events-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start text-left gap-1">
            <h1 className="text-base sm:text-lg font-medium md:text-xl leading-tight drop-shadow-md text-white text-balance mb-1">
              Your Journey Starts Before You Go
            </h1>
            <p className="text-white/90 text-xs md:text-sm font-normal drop-shadow-md mb-2">
              Inspiration, planning, and booking—all in one place.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative pt-24 md:pt-32 pb-40 md:pb-48 text-white min-h-[50vh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden rounded-b-xl md:rounded-none">
      {/* Slides */}
      {tours.map((tour, index) => (
        <div 
          key={tour.id} 
          className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        >
          <Image 
            src={tour.cover_image_url || tour.card_image_url || ""} 
            alt={tour.title} 
            fill 
            className="object-cover"
            priority={index === 0}
            quality={90}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
          />
          
          {/* Slide-specific Legibility Mask */}
          <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-black/70 to-transparent pointer-events-none"></div>
          
          {/* Slide Content */}
          <div className="absolute bottom-16 md:bottom-28 lg:bottom-32 w-full left-0 right-0 z-10 pointer-events-none">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex">
              <Link 
                href={`/activity/${tour.slug}`}
                className="flex flex-row flex-wrap items-center text-left gap-2 md:gap-3 cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto"
              >
                {tour.location && (
                  <span className="bg-pink-500 text-white text-[9px] md:text-xs uppercase font-bold px-1.5 md:px-3 py-0.5 md:py-1 rounded-full w-max shadow-sm tracking-wider shrink-0">
                    {tour.location.replace(', Sri Lanka', '')}
                  </span>
                )}
                
                <h1 className="text-sm font-normal md:text-3xl lg:text-4xl md:font-bold leading-tight drop-shadow-lg text-white line-clamp-2">
                  {tour.title}
                </h1>
              </Link>
            </div>
          </div>
        </div>
      ))}

    </section>
  )
}
