"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Hand, ChevronUp } from "lucide-react"

interface ActivityGalleryProps {
  galleryUrls: string[]
}

export function ActivityGallery({ galleryUrls }: ActivityGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [hasInteracted, setHasInteracted] = useState(false)
  const minSwipeDistance = 50

  const handleNext = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % galleryUrls.length)
    }
  }, [selectedIndex, galleryUrls.length])

  const handlePrev = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + galleryUrls.length) % galleryUrls.length)
    }
  }, [selectedIndex, galleryUrls.length])

  // Handle keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null)
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    if (selectedIndex !== null) {
      window.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [selectedIndex, handleNext, handlePrev])

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setHasInteracted(true)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance) handleNext()
    if (distance < -minSwipeDistance) handlePrev()
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
                onClick={() => setSelectedIndex(i)}
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
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[100] w-screen h-[100dvh] bg-black flex flex-col items-center justify-center p-0 transition-opacity"
          onClick={() => setSelectedIndex(null)}
        >
          <style>{`
            @keyframes swipe-indicator {
              0% { transform: translateX(20px); opacity: 0; }
              30% { opacity: 1; }
              70% { opacity: 1; }
              100% { transform: translateX(-20px); opacity: 0; }
            }
            .animate-swipe {
              animation: swipe-indicator 2s ease-in-out infinite;
            }
          `}</style>

          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent">
            <div className="text-white font-medium text-sm tracking-widest bg-black/30 px-3 py-1 rounded-full backdrop-blur-md">
              {selectedIndex + 1} OF {galleryUrls.length}
            </div>
            <button
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation()
                setSelectedIndex(null)
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Image Container */}
          <div
            className="relative flex items-center justify-center w-full h-full transform-gpu"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEndHandler}
          >
            {/* Left Nav (Desktop) */}
            <button
              className="hidden md:flex absolute left-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-50 backdrop-blur-md"
              onClick={handlePrev}
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <img
              src={galleryUrls[selectedIndex]}
              alt={`Fullscreen gallery view ${selectedIndex + 1}`}
              className="w-auto h-auto max-w-[100vw] max-h-[100vh] object-contain select-none rounded-none"
              draggable="false"
            />

            {/* Swipe Indicator (Mobile Only) */}
            {!hasInteracted && (
              <div className="md:hidden absolute inset-0 pointer-events-none flex items-center justify-center opacity-70">
                <div className="animate-swipe flex flex-col items-center gap-2 drop-shadow-xl">
                  <Hand className="w-10 h-10 text-white/90 drop-shadow-lg rotate-12" />
                </div>
              </div>
            )}

            {/* Right Nav (Desktop) */}
            <button
              className="hidden md:flex absolute right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-50 backdrop-blur-md"
              onClick={handleNext}
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
