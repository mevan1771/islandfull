"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { getTourCoordinates } from "@/lib/utils/coordinates"
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

export function InteractiveMap({ tours }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({})
  
  const [selectedTour, setSelectedTour] = useState<MapTour | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("All")

  // Setup Mapbox once
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current) return
    
    mapboxgl.accessToken = MAPBOX_TOKEN
    
    if (mapInstance.current) return // Map already initialized

    mapInstance.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [80.7718, 7.8731], // Sri Lanka center
      zoom: 6.5,
      pitch: 45,
      bearing: 0,
      attributionControl: false
    })

    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, [])

  // Smooth camera flyTo when a marker is clicked
  const handleMarkerClick = useCallback((tour: MapTour & { coords: { lat: number, lng: number } }) => {
    setSelectedTour(tour)
    
    mapInstance.current?.flyTo({
      center: [tour.coords.lng, tour.coords.lat],
      zoom: 12, // Zoom in
      pitch: 60, // Give it a nice 3D angle
      duration: 2000, // Smooth 2s animation
      essential: true
    })
  }, [])

  // Handle Markers & Filtering
  useEffect(() => {
    if (!mapInstance.current) return
    const map = mapInstance.current

    // Process coordinates
    const mapTours = tours.map(tour => {
      const coords = getTourCoordinates(tour.latitude, tour.longitude, tour.location)
      return { ...tour, coords }
    }).filter(t => t.coords !== null)

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Filter
    const filteredTours = mapTours.filter(tour => {
      if (activeCategory === "All") return true
      return tour.category.toLowerCase().includes(activeCategory.toLowerCase())
    })

    // Create custom DOM markers
    filteredTours.forEach(tour => {
      const el = document.createElement('div')
      
      const isSelected = selectedTour?.id === tour.id
      el.className = `relative group cursor-pointer transition-all duration-300 ease-out transform origin-bottom ${isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-110 z-10'}`

      el.innerHTML = `
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-colors ${isSelected ? 'bg-rose-500 text-white' : 'bg-white text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white'}">
          $${tour.price_usd}
        </div>
        <div class="w-14 h-14 rounded-full overflow-hidden border-2 shadow-lg transition-colors ${isSelected ? 'border-rose-500' : 'border-white'}">
          <img src="${tour.cover_image_url}" alt="${tour.title}" class="w-full h-full object-cover" />
        </div>
        <div class="w-3 h-3 absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45 transition-colors ${isSelected ? 'bg-rose-500' : 'bg-white'}"></div>
      `

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        handleMarkerClick(tour as any)
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([tour.coords!.lng, tour.coords!.lat])
        .addTo(map)

      markersRef.current[tour.id] = marker
    })

  }, [tours, activeCategory, selectedTour, handleMarkerClick])

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

      <div ref={mapContainer} className="w-full h-full" />

      {/* Bottom Drawer Preview for Selected Tour */}
      <MapPreviewDrawer 
        tour={selectedTour} 
        onClose={() => setSelectedTour(null)} 
      />

    </div>
  )
}
