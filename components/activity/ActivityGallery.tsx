"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Hand } from "lucide-react"

interface ActivityGalleryProps {
  galleryUrls: string[]
}

export function ActivityGallery({ galleryUrls }: ActivityGalleryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'

      // Scroll to initial index instantly when opened
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current
        // Use setTimeout to ensure DOM is ready
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
  }, [isOpen, currentIndex])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const slideWidth = container.clientWidth
    if (slideWidth === 0) return
    const newIndex = Math.round(container.scrollLeft / slideWidth)
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < galleryUrls.length) {
      setCurrentIndex(newIndex)
    }
  }

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
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] w-screen h-[100dvh] bg-black flex flex-col items-center justify-center p-0 transition-opacity"
          onClick={() => setIsOpen(false)}
        >
          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white font-medium text-sm tracking-widest bg-black/30 px-3 py-1 rounded-full backdrop-blur-md">
              {currentIndex + 1} OF {galleryUrls.length}
            </div>
            <button
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Image Container (Native Scroll) */}
          <div
            ref={scrollContainerRef}
            className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            onScroll={handleScroll}
            onClick={(e) => e.stopPropagation()}
          >
            {galleryUrls.map((url, i) => (
              <div key={i} className="w-full h-full shrink-0 snap-center relative flex items-center justify-center">
                <img
                  src={url}
                  alt={`Fullscreen gallery view ${i + 1}`}
                  className="w-auto h-auto max-w-[100vw] max-h-[100vh] object-contain select-none rounded-none"
                  draggable="false"
                  loading={i === 0 ? undefined : "lazy"}
                />
              </div>
            ))}
          </div>

          {/* Left Nav (Desktop) */}
          <button
            className="hidden md:flex absolute left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-50 backdrop-blur-md"
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
            className="hidden md:flex absolute right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-50 backdrop-blur-md"
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
        </div>
      )}
    </>
  )
}
