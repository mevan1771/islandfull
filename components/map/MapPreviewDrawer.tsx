"use client"

import { useState, useEffect } from "react"
import { MapTour } from "./InteractiveMap"
import Image from "next/image"
import Link from "next/link"
import { Star, Clock, X, ChevronRight, CheckCircle2, User } from "lucide-react"
import { FavoriteButton } from "@/components/ui/FavoriteButton"

interface MapPreviewDrawerProps {
  tour: MapTour | null
  onClose: () => void
}

export function MapPreviewDrawer({ tour, onClose }: MapPreviewDrawerProps) {
  const [currentTour, setCurrentTour] = useState<MapTour | null>(tour)
  const [isAnimating, setIsAnimating] = useState(false)

  // Handle smooth transition between tours
  useEffect(() => {
    if (tour?.id !== currentTour?.id) {
      if (!tour) {
        // closing
        setCurrentTour(null)
      } else if (!currentTour) {
        // opening from null
        setCurrentTour(tour)
      } else {
        // switching tours
        setIsAnimating(true)
        const timer = setTimeout(() => {
          setCurrentTour(tour)
          setIsAnimating(false)
        }, 300)
        return () => clearTimeout(timer)
      }
    }
  }, [tour, currentTour?.id])

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 md:left-6 md:right-auto md:translate-x-0 md:bottom-6 p-4 md:p-0 flex justify-center md:justify-start pointer-events-none transition-transform duration-500 ease-out z-[100] w-full md:w-[400px]
        ${tour ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'}
      `}
    >
      {currentTour && (
        <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-sm md:max-w-none pointer-events-auto overflow-hidden flex flex-col transform transition-opacity duration-300 relative ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          
          {/* Cover Image */}
          <div className="relative w-full h-48 md:h-[220px] min-h-[200px] md:min-h-0">
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-black/40 sm:bg-white/90 hover:bg-black/60 sm:hover:bg-white text-white sm:text-zinc-600 rounded-full backdrop-blur-md sm:backdrop-blur-none transition-colors shadow-sm border-transparent sm:border sm:border-zinc-200"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <Image
              src={currentTour.cover_image_url}
              alt={currentTour.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:hidden" />
            
            {/* Favorite Button spaced to the left of the close button */}
            <FavoriteButton activityId={currentTour.id} className="right-14 sm:right-[72px]" />

            {/* Mobile Title overlay */}
            <div className="absolute bottom-3 left-4 text-white md:hidden">
              <p className="text-sm font-medium opacity-90">{currentTour.location}</p>
              <h3 className="text-xl font-bold leading-tight">{currentTour.title}</h3>
            </div>
          </div>

          {/* Details */}
          <div className="p-4 md:p-6 bg-white flex-1 flex flex-col justify-between max-h-[50vh] md:max-h-[60vh] overflow-y-auto hide-scrollbar">
            <div>
              <div className="hidden md:block mb-4">
                 <p className="text-sm font-bold text-rose-500 uppercase tracking-wide mb-1">{currentTour.location}</p>
                 <h3 className="text-2xl font-bold leading-tight text-zinc-900 mb-2">{currentTour.title}</h3>
                 
                 {/* Host Info */}
                 {currentTour.hostName && (
                   <div className="flex items-center gap-2 mb-3">
                     <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center">
                       <User className="w-3.5 h-3.5 text-rose-600" />
                     </div>
                     <span className="text-sm font-medium text-zinc-700">Hosted by {currentTour.hostName}</span>
                   </div>
                 )}

                 <p className="text-sm text-zinc-500 line-clamp-3 mb-4">{currentTour.description || "Discover this unforgettable experience."}</p>
                 
                 {/* Inclusions */}
                 {currentTour.inclusions && currentTour.inclusions.length > 0 && (
                   <div className="mb-4">
                     <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-2">What's Included</h4>
                     <ul className="grid grid-cols-2 gap-y-1.5 gap-x-2">
                       {currentTour.inclusions.slice(0, 4).map((inc, i) => (
                         <li key={i} className="text-xs text-zinc-600 flex items-start gap-1.5">
                           <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                           <span className="line-clamp-1">{inc}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
              </div>

              <div className="flex items-center justify-between mb-4 md:mb-6 md:mt-2 md:border-t md:border-zinc-100 md:pt-4">
                <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-zinc-600">
                  <div className="flex items-center gap-1">
                    {!currentTour.reviewCount ? (
                      <>
                        <Star className="w-4 h-4 text-rose-500 fill-rose-500" />
                        <span className="font-medium text-rose-500">New</span>
                      </>
                    ) : (
                      <>
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-medium text-zinc-900">{currentTour.rating?.toFixed(1)}</span>
                        <span className="text-zinc-400">({currentTour.reviewCount})</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 opacity-70" />
                    <span>{currentTour.duration}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-500 block">From</span>
                  <p className="text-lg md:text-2xl font-bold text-zinc-900">${currentTour.price_usd}</p>
                </div>
              </div>
            </div>

            <Link 
              href={`/activity/${currentTour.slug || currentTour.id}`}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white py-3.5 rounded-xl font-semibold transition-colors mt-2 flex-shrink-0"
            >
              View Details
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
