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
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-8 mb-3">Gallery</h2>
        <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory gap-2 pb-4 px-4 -mx-4 md:grid md:grid-cols-2 md:gap-4 md:pb-0 md:px-0 md:mx-0">
          {galleryUrls.map((url: string, i: number) => (
            <div 
              key={i} 
              className="relative snap-center aspect-[4/3] md:aspect-video w-4/5 sm:w-2/3 md:w-auto flex-shrink-0 rounded-xl md:rounded-3xl overflow-hidden shadow-sm group cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImage(url)}
            >
              <Image 
                src={url} 
                alt={`Gallery image ${i + 1}`} 
                fill 
                placeholder="blur" 
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=" 
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute bottom-3 right-3 md:hidden bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                {i + 1}/{galleryUrls.length}
              </div>
            </div>
          ))}
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
