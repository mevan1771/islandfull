import Image from "next/image"
import Link from "next/link"
import { Clock, MapPin, Star } from "lucide-react"

interface ActivityCardProps {
  title: string
  slug: string
  location: string
  duration: string
  priceUsd: number
  coverImage: string
}

export function ActivityCard({
  title,
  slug,
  location,
  duration,
  priceUsd,
  coverImage,
}: ActivityCardProps) {
  return (
    <Link href={`/activity/${slug}`} className="block group">
      <div className="flex flex-col gap-3">
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-zinc-100">
          <Image
            src={coverImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          {/* Rating Pill overlay (Mocked rating for UI) */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-bold text-zinc-900">4.9</span>
            <span className="text-xs font-medium text-zinc-500">(1.2k)</span>
          </div>
        </div>
        
        {/* Content Details */}
        <div>
          <h3 className="text-[1.1rem] font-bold text-zinc-900 mb-1 line-clamp-1 group-hover:text-rose-500 transition-colors">
            {title}
          </h3>
          
          <div className="flex items-center gap-1.5 text-zinc-500 mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span className="text-sm">{location}, Sri Lanka</span>
          </div>

          <p className="text-sm font-medium text-zinc-600 mb-2">
            {duration}
          </p>
          
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-[1.15rem] font-bold text-zinc-900">${priceUsd}</span>
            <span className="text-xs font-medium text-zinc-400">/person</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
