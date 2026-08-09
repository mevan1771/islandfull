"use client"

import { MapTour } from "./InteractiveMap"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock, X, ChevronRight } from "lucide-react"
import { FavoriteButton } from "@/components/ui/FavoriteButton"

interface MapPreviewDrawerProps {
  tour: MapTour | null
  onClose: () => void
}

export function MapPreviewDrawer({ tour, onClose }: MapPreviewDrawerProps) {
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 md:left-1/2 md:-translate-x-1/2 md:bottom-28 p-4 md:p-0 flex justify-center pointer-events-none transition-transform duration-500 ease-out z-[100] w-full
        ${tour ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'}
      `}
    >
      {tour && (
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm md:max-w-2xl lg:max-w-3xl pointer-events-auto overflow-hidden flex flex-col md:flex-row transform transition-all relative">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-3 left-3 md:left-auto md:right-3 z-20 p-1.5 bg-black/40 hover:bg-black/60 md:bg-zinc-100 md:hover:bg-zinc-200 text-white md:text-zinc-600 rounded-full backdrop-blur-sm md:backdrop-blur-none transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Cover Image */}
          <div className="relative w-full h-48 md:w-2/5 md:h-auto min-h-[200px] md:min-h-[260px]">
            <Image
              src={tour.cover_image_url}
              alt={tour.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent hidden md:block" />
            
            <FavoriteButton activityId={tour.id} />

            <div className="absolute bottom-3 left-4 text-white md:hidden">
              <p className="text-sm font-medium opacity-90">{tour.location}</p>
              <h3 className="text-xl font-bold leading-tight">{tour.title}</h3>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 md:p-6 bg-white flex-1 flex flex-col justify-between">
            <div>
              <div className="hidden md:block mb-4">
                 <p className="text-sm font-bold text-rose-500 uppercase tracking-wide mb-1">{tour.location}</p>
                 <h3 className="text-2xl font-bold leading-tight text-zinc-900 mb-2">{tour.title}</h3>
                 <p className="text-sm text-zinc-500 line-clamp-2">{tour.description || "Discover this unforgettable experience."}</p>
              </div>

              <div className="flex items-center justify-between mb-4 md:mb-6 md:mt-2">
                <div className="flex items-center gap-4 text-sm text-zinc-600">
                  <div className="flex items-center gap-1">
                    {!tour.reviewCount ? (
                      <>
                        <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
                        <span className="font-medium text-rose-500">New</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium text-zinc-900">{tour.rating?.toFixed(1)}</span>
                        <span className="text-zinc-400">({tour.reviewCount})</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 opacity-70" />
                    <span>{tour.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 block">From</span>
                  <p className="text-lg md:text-2xl font-bold text-zinc-900">${tour.price_usd}</p>
                </div>
              </div>
            </div>

            <Link 
              href={`/activity/${tour.slug || tour.id}`}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white py-3.5 rounded-xl font-semibold transition-colors"
            >
              View Tour Details
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
