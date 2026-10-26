"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useRef } from "react"
import { Clock, MapPin, Star, Gem } from "lucide-react"
import { FavoriteButton } from "@/components/ui/FavoriteButton"
import { CountdownTimer } from "@/components/ui/CountdownTimer"
import { formatUSD } from "@/lib/utils"
import { markHomeScrollForRestore, markPageReturn } from "@/lib/home-scroll"
import { getLowestPerPersonFromTiers, hasPricingTiers } from "@/lib/pricingTiers"

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
  discountPrice?: number
  dealEndDate?: string
  pricingTiers?: Record<string, number> | unknown
  alwaysShowFavorite?: boolean
  variant?: "tour" | "place"
  allowOffers?: boolean
  href?: string
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
  pricingTiers,
  alwaysShowFavorite = false,
  variant = "tour",
  allowOffers = false,
  href,
}: ActivityCardProps) {
  const isPlace = variant === "place"
  const displayLocation = location.replace(', Sri Lanka', '')
  const videoRef = useRef<HTMLVideoElement>(null)
  const pointerStart = useRef({ x: 0, y: 0 })

  const isDealActive = discountPrice && dealEndDate && new Date(dealEndDate) > new Date();
  const hasGroupTiers = hasPricingTiers(pricingTiers)
  const lowestPerPerson = hasGroupTiers ? getLowestPerPersonFromTiers(pricingTiers) : null

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
    <Link
      href={href || `/activity/${slug}`}
      prefetch={true}
      className="block group h-full"
      data-home-card={slug}
      onPointerDown={(event) => {
        pointerStart.current = { x: event.clientX, y: event.clientY }
        markHomeScrollForRestore(slug)
        markPageReturn()
      }}
      onClick={(event) => {
        const moved =
          Math.abs(event.clientX - pointerStart.current.x) > 12 ||
          Math.abs(event.clientY - pointerStart.current.y) > 12
        if (moved) {
          event.preventDefault()
          event.stopPropagation()
          return
        }
        markHomeScrollForRestore(slug)
        markPageReturn()
      }}
    >
      <div className="flex flex-col gap-2 h-full">
        {/* Image / Video Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-xl md:rounded-3xl bg-zinc-100 shadow-md md:shadow-lg hover:shadow-xl transition-shadow duration-300">
          {videoUrl && !isPlace ? (
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
              src={coverImage || "/placeholder.jpg"}
              alt={title}
              fill
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          )}
          <FavoriteButton activityId={id} />
          {isPlace && (
            <span className="absolute bottom-2 right-2 z-10 rounded-md bg-white/95 px-1.5 py-px text-[9px] sm:text-[10px] font-bold text-zinc-800 leading-4 shadow-sm">
              Must see
            </span>
          )}
          {!isPlace && allowOffers && (
            <span className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-10 inline-flex items-center rounded-full bg-[#FFC72C] px-2.5 h-6 md:h-7 md:px-3 text-[11px] md:text-xs font-bold text-zinc-900 shadow-md">
              Make offer
            </span>
          )}
        </div>

        {/* Content Details */}
        <div className="flex flex-col flex-1 pb-1 mt-1.5 px-1 sm:px-0">

          <h3 className="text-xs sm:text-sm md:text-base font-semibold text-zinc-900 mb-1 leading-tight w-full line-clamp-2 group-hover:text-rose-500 transition-colors">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 truncate mb-1">
            {!isPlace && (rating || isHiddenGem || reviewCount === 0) && (
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

            {!isPlace && (rating || isHiddenGem || reviewCount === 0) && (
              <span className="text-gray-300 flex-shrink-0">•</span>
            )}

            <span className="truncate">{displayLocation}</span>
          </div>

          <div className="flex flex-col mt-auto pt-1.5">
            <div className="flex items-center gap-1.5 whitespace-nowrap overflow-hidden">
              <div className="flex items-center flex-nowrap whitespace-nowrap gap-1 flex-shrink-0">
                {isPlace ? (
                  <span className="text-xs sm:text-sm font-bold text-zinc-800">Free to visit</span>
                ) : priceUsd === 0 ? (
                  <span className="text-xs sm:text-sm font-bold text-emerald-600">Free</span>
                ) : (
                  <>
                    {isDealActive && discountPrice ? (
                      <>
                        <del className="text-xs sm:text-sm text-red-500">{formatUSD(priceUsd)}</del>
                        <span className="text-sm sm:text-base font-bold text-gray-900">{formatUSD(discountPrice)}</span>
                        <span className="text-xs sm:text-sm font-normal text-gray-500">
                          {priceSuffix ? ` ${priceSuffix}` : ''}
                        </span>
                      </>
                    ) : hasGroupTiers && lowestPerPerson != null ? (
                      <>
                        <span className="text-xs sm:text-sm font-medium text-gray-500">From</span>
                        <span className="text-sm sm:text-base font-bold text-gray-900">{formatUSD(lowestPerPerson)}</span>
                        <span className="text-xs sm:text-sm font-normal text-gray-500"> / 👤</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm sm:text-base font-bold text-gray-900">{formatUSD(priceUsd)}</span>
                        <span className="text-xs sm:text-sm font-normal text-gray-500">
                          {priceSuffix ? ` ${priceSuffix}` : ''}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              <span className="text-gray-300 text-xs sm:text-sm flex-shrink-0">•</span>
              <span className="text-xs sm:text-sm font-normal text-gray-500 truncate">{duration}</span>
            </div>

          </div>
        </div>
      </div>
    </Link>
  )
}
