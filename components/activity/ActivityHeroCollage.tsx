"use client"

import { useState } from "react"
import Image from "next/image"
import { Images } from "lucide-react"
import { PhotoLightbox } from "@/components/activity/PhotoLightbox"

const BLUR =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="

function uniqueUrls(cover: string, gallery: string[]) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of [cover, ...gallery]) {
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  return out
}

export function ActivityHeroCollage({
  coverUrl,
  galleryUrls = [],
  title,
}: {
  coverUrl: string
  galleryUrls?: string[] | null
  title: string
}) {
  const all = uniqueUrls(coverUrl, Array.isArray(galleryUrls) ? galleryUrls : [])
  const cover = all[0] || "/placeholder.jpg"
  const side = all.slice(1, 5)
  const hasCollage = side.length > 0

  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const sideGridClass =
    side.length >= 3
      ? "grid-cols-2 grid-rows-2"
      : side.length === 2
        ? "grid-cols-1 grid-rows-2"
        : "grid-cols-1 grid-rows-1"

  return (
    <>
      <div className="px-4 mx-auto max-w-7xl">
        <div
          className={`relative ${
            hasCollage
              ? "grid grid-cols-1 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-2 md:gap-2.5 h-[35svh] md:h-[480px]"
              : "h-[35svh] md:h-[480px]"
          }`}
        >
          <button
            type="button"
            aria-label={`View photos of ${title || "this activity"}`}
            className="relative w-full h-full min-h-0 overflow-hidden rounded-2xl sm:rounded-3xl text-left shadow-md"
            onClick={() => setOpenIndex(0)}
          >
            <Image
              src={cover}
              alt={title || "Activity"}
              fill
              sizes="(max-width: 768px) 100vw, 65vw"
              quality={95}
              unoptimized
              placeholder="blur"
              blurDataURL={BLUR}
              className="object-cover object-center"
              priority
              fetchPriority="high"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none md:hidden" />
          </button>

          {hasCollage && (
            <div className={`hidden md:grid gap-2 md:gap-2.5 h-full min-h-0 ${sideGridClass}`}>
              {side.map((url, i) => {
                const isLast = i === side.length - 1 && all.length > side.length + 1
                return (
                  <button
                    key={url + i}
                    type="button"
                    className="relative overflow-hidden rounded-2xl bg-zinc-100 shadow-md"
                    onClick={() => setOpenIndex(i + 1)}
                  >
                    <Image src={url} alt="" fill sizes="30vw" unoptimized className="object-cover" />
                    {isLast && (
                      <span className="absolute inset-0 bg-black/45 flex items-center justify-center text-white text-sm font-semibold gap-2">
                        <Images className="w-4 h-4" />
                        Show all photos
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {openIndex !== null && (
        <PhotoLightbox
          urls={all}
          startIndex={openIndex}
          alt={title || "Activity"}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  )
}
