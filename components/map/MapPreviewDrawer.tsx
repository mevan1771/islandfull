"use client"

import { MapTour } from "./InteractiveMap"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock, X, ChevronRight } from "lucide-react"

interface MapPreviewDrawerProps {
  tour: MapTour | null
  onClose: () => void
}

export function MapPreviewDrawer({ tour, onClose }: MapPreviewDrawerProps) {
  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 md:left-8 md:right-auto md:bottom-8 p-4 md:p-0 flex justify-center md:justify-start pointer-events-none transition-transform duration-500 ease-out z-[100]
        ${tour ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
      `}
    >
      {tour && (
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm pointer-events-auto overflow-hidden flex flex-col transform transition-all">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-1.5 bg-black/40 hover:bg-black/60 text-white rounded-full backdrop-blur-sm transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Cover Image */}
          <div className="relative w-full h-48">
            <Image
              src={tour.cover_image_url}
              alt={tour.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
              <p className="text-sm font-medium opacity-90">{tour.location}</p>
              <h3 className="text-xl font-bold leading-tight">{tour.title}</h3>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4 text-sm text-zinc-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <span className="font-medium text-zinc-900">{tour.rating?.toFixed(1) || '4.9'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 opacity-70" />
                  <span>{tour.duration}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500">From</span>
                <p className="text-lg font-bold text-zinc-900">${tour.price_usd}</p>
              </div>
            </div>

            <Link 
              href={`/tours/${tour.id}`}
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
