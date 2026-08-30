"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface ActivityGalleryProps {
  galleryUrls: string[]
}

export function ActivityGallery({ galleryUrls }: ActivityGalleryProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])

  // Handle keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
      if (e.key === 'ArrowRight' && scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: scrollContainerRef.current.clientWidth, behavior: 'smooth' })
      }
      if (e.key === 'ArrowLeft' && scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ left: -scrollContainerRef.current.clientWidth, behavior: 'smooth' })
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
      
      // Scroll to initial index instantly when opened
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        setTimeout(() => {
          container.scrollTo({ left: container.clientWidth * currentIndex, behavior: 'auto' })
        }, 0)
      }
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen]) // Only run on open/close

  // Intersection Observer for Counter
  useEffect(() => {
    if (!isOpen) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute('data-index'))
            if (!isNaN(index)) {
              setCurrentIndex(index)
            }
          }
        })
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.6,
      }
    )

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide)
    })

    return () => observer.disconnect()
  }, [isOpen])

  if (!galleryUrls || galleryUrls.length === 0) return null

  return (
    <>
      <section>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Gallery</h2>
        <div className="grid grid-cols-2 gap-1 sm:gap-2 w-full auto-rows-[130px] sm:auto-rows-[175px] md:auto-rows-[250px]">
          {galleryUrls.map((url: string, i: number) => {
            return (
              <div
                key={i}
                className="relative group cursor-pointer hover:opacity-90 transition-opacity rounded-2xl overflow-hidden bg-gray-100"
                onClick={() => {
                  setCurrentIndex(i)
                  setIsOpen(true)
                }}
              >
                <Image
                  src={url}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  priority={i < 2}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )
          })}
        </div>
      </section>

      {/* Lightbox Overlay */}
      {isOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[999999] bg-black touch-none flex flex-col justify-between select-none"
          onClick={() => setIsOpen(false)}
        >
          {/* Top Bar */}
          <div className="absolute top-4 left-4 z-[10] text-white font-medium text-sm tracking-widest bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">
            {currentIndex + 1} OF {galleryUrls.length}
          </div>
          <button
            className="absolute top-4 right-4 z-[10] p-3 text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors backdrop-blur-md"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main Image Container (Native Scroll) */}
          <div
            ref={scrollContainerRef}
            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-x-contain touch-pan-x"
            onClick={(e) => e.stopPropagation()}
          >
            {galleryUrls.map((url, i) => (
              <div 
                key={i} 
                ref={(el) => { slideRefs.current[i] = el; }}
                data-index={i}
                className="w-full h-full shrink-0 snap-center snap-always relative flex items-center justify-center"
              >
                <img
                  src={url}
                  alt={`Fullscreen gallery view ${i + 1}`}
                  className="w-auto h-auto max-w-[100vw] max-h-[100vh] object-contain select-none rounded-none"
                  draggable="false"
                  loading={Math.abs(currentIndex - i) <= 1 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* Left Nav (Desktop) */}
          <button
            className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-[10] backdrop-blur-md"
            onClick={(e) => {
              e.stopPropagation()
              if (scrollContainerRef.current) {
                const container = scrollContainerRef.current
                container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' })
              }
            }}
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Right Nav (Desktop) */}
          <button
            className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-[10] backdrop-blur-md"
            onClick={(e) => {
              e.stopPropagation()
              if (scrollContainerRef.current) {
                const container = scrollContainerRef.current
                container.scrollBy({ left: container.clientWidth, behavior: 'smooth' })
              }
            }}
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>,
        document.body
      )}
    </>
  )
}
