"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X } from "lucide-react"

interface ActivityGalleryProps {
  galleryUrls: string[]
}

export function ActivityGallery({ galleryUrls }: ActivityGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null)
    }
    if (selectedImage) {
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
  }, [selectedImage])

  if (!galleryUrls || galleryUrls.length === 0) return null

  return (
    <>
      <section>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Gallery</h2>
        <div className="grid grid-cols-2 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[250px] sm:h-[350px] md:h-[450px] w-full">
          {galleryUrls.slice(0, 4).map((url: string, i: number) => {
            const isLast = i === 3;
            const hasMore = galleryUrls.length > 4;
            
            return (
              <div 
                key={i} 
                className="relative col-span-1 row-span-1 group cursor-pointer hover:opacity-90 transition-opacity rounded-xl shadow-sm overflow-hidden"
                onClick={() => setSelectedImage(url)}
              >
                <Image 
                  src={url} 
                  alt={`Gallery image ${i + 1}`} 
                  fill 
                  placeholder="blur" 
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                {isLast && hasMore && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm sm:text-base">+{galleryUrls.length - 4} Photos</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Lightbox Overlay */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 transition-opacity"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-50"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedImage(null)
            }}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="relative flex items-center justify-center max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedImage}
              alt="Fullscreen gallery view"
              className="max-w-full max-h-[90vh] object-contain rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  )
}
