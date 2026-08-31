"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Clock, MapPin, Star, Gem } from "lucide-react"
import { FavoriteButton } from "@/components/ui/FavoriteButton"
import { CountdownTimer } from "@/components/ui/CountdownTimer"

interface ActivityCardProps {
  id: string
  title: string
  slug: string
  location: string
  duration: string
  priceUsd: number
  coverImage: string
  isHiddenGem?: boolean
  rating?: number
  reviewCount?: number
  pricingModel?: 'per_person' | 'per_day' | 'flat_rate'
  maxGuests?: number
  priceSuffix?: string
  discountPrice?: number | null
  dealEndDate?: string | null
}

export function ActivityCard({
  id,
  title,
  slug,
  location,
  duration,
  priceUsd,
  coverImage,
  isHiddenGem = false,
  rating,
  reviewCount = 0,
  pricingModel = 'per_person',
  maxGuests,
  priceSuffix,
  discountPrice,
  dealEndDate,
}: ActivityCardProps) {
  const displayLocation = location.replace(', Sri Lanka', '')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isDealActive, setIsDealActive] = useState(false)

  useEffect(() => {
    if (discountPrice && dealEndDate) {
      const endDate = new Date(dealEndDate)
      if (endDate > new Date()) {
        setIsDealActive(true)
      }
    }
  }, [discountPrice, dealEndDate])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch((e) => console.log('Video autoplay prevented:', e))
        } else {
          video.pause()
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Derive Cloudinary video URL from image URL
  let videoUrl: string | null = null
  if (coverImage?.includes('res.cloudinary.com')) {
    videoUrl = coverImage
      .replace('/image/upload/', '/video/upload/f_auto,q_auto,c_fill,ar_9:16/')
      .replace(/\.(jpg|jpeg|png|webp|avif)$/i, '.mp4')
  }

  return (
    <Link href={`/activity/${slug}`} prefetch={true} className="block group h-full">
      <div className="flex flex-col gap-2 h-full">
        {/* Image / Video Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl md:rounded-3xl bg-zinc-100">
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              poster={coverImage}
              preload="none"
              playsInline
              muted
              loop
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <Image
              src={coverImage}
              alt={title}
              fill
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          )}
          <FavoriteButton activityId={id} className="hidden md:flex" />
        </div>

        {/* Content Details */}
        <div className="flex flex-col flex-1 pb-1 mt-1.5 px-1 sm:px-0">

          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-zinc-900 mb-1 leading-tight w-full line-clamp-2 group-hover:text-rose-500 transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 truncate mb-1">
            {(rating || isHiddenGem || reviewCount === 0) && (
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {isHiddenGem ? (
                  <>
                    <Gem className="w-3 h-3 text-blue-500 fill-blue-500 drop-shadow-sm" />
                    <span className="font-bold text-rose-500">Gem</span>
                  </>
                ) : reviewCount === 0 || !rating ? (
                  <>
                    <Star className="w-3 h-3 fill-rose-500 text-rose-500 drop-shadow-sm" />
                    <span className="font-bold text-rose-500">New</span>
                  </>
                ) : (
                  <>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                    <span className="font-bold text-gray-700">{rating.toFixed(1)}</span>
                    <span className="text-gray-400">({reviewCount})</span>
                  </>
                )}
              </div>
            )}

            {(rating || isHiddenGem || reviewCount === 0) && (
              <span className="text-gray-300 flex-shrink-0">•</span>
            )}

            <span className="truncate">{displayLocation}</span>
          </div>

          <div className="flex flex-col mt-auto pt-1.5">
            <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
              <div className="flex items-baseline gap-0.5 flex-shrink-0">
                {priceUsd === 0 ? (
                  <span className="text-xs sm:text-sm font-bold text-emerald-600">Free</span>
                ) : (
                  <>
                    {isDealActive && discountPrice ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm sm:text-base font-bold text-rose-600">${discountPrice}</span>
                          <span className="text-xs font-medium text-gray-400 line-through">${priceUsd}</span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-normal text-gray-500">
                          {priceSuffix ? ` ${priceSuffix}` : ''}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm sm:text-base font-bold text-gray-900">${priceUsd}</span>
                        <span className="text-[10px] sm:text-xs font-normal text-gray-500">
                          {priceSuffix ? ` ${priceSuffix}` : ''}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              <span className="text-gray-300 text-[10px] sm:text-xs flex-shrink-0">•</span>
              <span className="text-[10px] sm:text-xs font-normal text-gray-500 truncate">{duration}</span>
            </div>
            {isDealActive && dealEndDate && (
              <div className="mt-2">
                <CountdownTimer targetDate={dealEndDate} onExpire={() => setIsDealActive(false)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
