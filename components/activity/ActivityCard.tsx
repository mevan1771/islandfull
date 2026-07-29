import Image from "next/image"
import Link from "next/link"
import { Clock, MapPin, Star, Gem } from "lucide-react"
import { FavoriteButton } from "@/components/ui/FavoriteButton"

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
}: ActivityCardProps) {
  const displayLocation = location.replace(', Sri Lanka', '')

  return (
    <Link href={`/activity/${slug}`} className="block group h-full">
      <div className="flex flex-col gap-2 h-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] sm:aspect-[3/4] w-full overflow-hidden rounded-xl md:rounded-3xl bg-zinc-100">
          <Image
            src={coverImage}
            alt={title}
            fill
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <FavoriteButton activityId={id} />
        </div>
        
        {/* Content Details */}
        <div className="flex flex-col flex-1 pb-1">
          <h3 className="text-xs sm:text-base font-semibold text-zinc-900 mb-1 leading-snug w-full line-clamp-2 group-hover:text-rose-500 transition-colors">
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

          <div className="flex items-center gap-1.5 mt-auto pt-1.5">
            <div className="flex items-baseline gap-0.5">
              {priceUsd === 0 ? (
                <span className="text-xs sm:text-sm font-bold text-emerald-600">Free</span>
              ) : (
                <>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">${priceUsd}</span>
                  <span className="text-[10px] sm:text-xs font-normal text-gray-500">/ person</span>
                </>
              )}
            </div>
            <span className="text-gray-300 text-[10px] sm:text-xs flex-shrink-0">•</span>
            <span className="text-[10px] sm:text-xs font-normal text-gray-500 truncate">{duration}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
