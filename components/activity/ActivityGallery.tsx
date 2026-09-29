"use client"

import { useState } from "react"
import Image from "next/image"
import { PhotoLightbox } from "@/components/activity/PhotoLightbox"

interface ActivityGalleryProps {
  galleryUrls: string[]
}

export function ActivityGallery({ galleryUrls }: ActivityGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!galleryUrls || galleryUrls.length === 0) return null

  return (
    <>
      <section>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Gallery</h2>
        <div className="grid grid-cols-2 gap-1 sm:gap-2 w-full auto-rows-[130px] sm:auto-rows-[175px] md:auto-rows-[250px]">
          {galleryUrls.map((url: string, i: number) => (
            <div
              key={i}
              className="relative group cursor-pointer hover:opacity-90 transition-opacity rounded-2xl overflow-hidden bg-gray-100"
              onClick={() => setOpenIndex(i)}
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
          ))}
        </div>
      </section>

      {openIndex !== null && (
        <PhotoLightbox
          urls={galleryUrls}
          startIndex={openIndex}
          alt="Gallery photo"
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  )
}
