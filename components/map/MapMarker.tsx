"use client"

import { Marker } from "react-map-gl"
import Image from "next/image"

interface MapMarkerProps {
  tour: {
    id: string
    title: string
    price_usd: number
    cover_image_url: string
  }
  coords: { lat: number; lng: number }
  isSelected: boolean
  onClick: () => void
}

export function MapMarker({ tour, coords, isSelected, onClick }: MapMarkerProps) {
  return (
    <Marker
      longitude={coords.lng}
      latitude={coords.lat}
      anchor="bottom"
      onClick={e => {
        e.originalEvent.stopPropagation()
        onClick()
      }}
    >
      <div 
        className={`relative group cursor-pointer transition-all duration-300 ease-out transform origin-bottom
          ${isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-110 z-10'}
        `}
      >
        {/* Price Badge */}
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-colors
          ${isSelected ? 'bg-rose-500 text-white' : 'bg-white text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white'}
        `}>
          ${tour.price_usd}
        </div>

        {/* Circular Photo Pin */}
        <div className={`w-14 h-14 rounded-full overflow-hidden border-2 shadow-lg transition-colors
          ${isSelected ? 'border-rose-500' : 'border-white'}
        `}>
          <Image
            src={tour.cover_image_url}
            alt={tour.title}
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Pin Triangle Pointer */}
        <div className={`w-3 h-3 absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45 transition-colors
          ${isSelected ? 'bg-rose-500' : 'bg-white'}
        `} />
      </div>
    </Marker>
  )
}
