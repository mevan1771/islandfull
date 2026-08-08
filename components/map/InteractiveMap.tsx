"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Map, { MapRef, ViewState } from "react-map-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { getTourCoordinates } from "@/lib/utils/coordinates"
import { MapMarker } from "./MapMarker"
import { MapPreviewDrawer } from "./MapPreviewDrawer"
import { MapFilterBar } from "./MapFilterBar"

export interface MapTour {
  id: string
  title: string
  location: string
  price_usd: number
  cover_image_url: string
  duration: string
  category: string
  latitude?: number | null
  longitude?: number | null
  rating?: number
}

interface InteractiveMapProps {
  tours: MapTour[]
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Default to Sri Lanka center
const INITIAL_VIEW_STATE = {
  longitude: 80.7718,
  latitude: 7.8731,
  zoom: 6.5,
  pitch: 45,
  bearing: 0
}

export function InteractiveMap({ tours }: InteractiveMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [selectedTour, setSelectedTour] = useState<MapTour | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("All")
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE)

  // Map tours to include processed coordinates
  const mapTours = tours.map(tour => {
    const coords = getTourCoordinates(tour.latitude, tour.longitude, tour.location)
    return { ...tour, coords }
  }).filter(t => t.coords !== null) // Ensure only tours with coords are rendered

  // Filter based on active category
  const filteredTours = mapTours.filter(tour => {
    if (activeCategory === "All") return true
    return tour.category.toLowerCase().includes(activeCategory.toLowerCase())
  })

  // Smooth camera flyTo when a marker is clicked
  const handleMarkerClick = useCallback((tour: MapTour & { coords: { lat: number, lng: number } }) => {
    setSelectedTour(tour)
    
    mapRef.current?.flyTo({
      center: [tour.coords.lng, tour.coords.lat],
      zoom: 12, // Zoom in
      pitch: 60, // Give it a nice 3D angle
      duration: 2000, // Smooth 2s animation
      essential: true
    })
  }, [])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-zinc-900 text-white">
        <p>Mapbox token is missing in .env.local</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-zinc-900">
      
      {/* Category Filter Bar (Floating on top) */}
      <MapFilterBar 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
      />

      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12" // Premium satellite style
        attributionControl={false}
      >
        {/* Render Markers */}
        {filteredTours.map((tour) => (
          <MapMarker
            key={tour.id}
            tour={tour}
            coords={tour.coords!}
            isSelected={selectedTour?.id === tour.id}
            onClick={() => handleMarkerClick(tour as any)}
          />
        ))}
      </Map>

      {/* Bottom Drawer Preview for Selected Tour */}
      <MapPreviewDrawer 
        tour={selectedTour} 
        onClose={() => setSelectedTour(null)} 
      />

    </div>
  )
}
