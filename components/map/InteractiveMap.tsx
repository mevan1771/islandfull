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

// Create a type to hold our stable marker references
interface MarkerRef {
  marker: mapboxgl.Marker
  el: HTMLDivElement
  tour: MapTour
  coords: { lat: number, lng: number }
}

export function InteractiveMap({ tours }: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [id: string]: MarkerRef }>({})
  
  const [selectedTour, setSelectedTour] = useState<MapTour | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("All")

  // Setup Mapbox STRICTLY ONCE
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current) return
    
    mapboxgl.accessToken = MAPBOX_TOKEN
    
    if (mapInstance.current) return // Map already initialized

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [80.0, -5.0], // Start out over the Indian Ocean
      zoom: 3,
      minZoom: 2,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    })

    map.on('load', () => {
      map.resize() // Fix container layout offsets

      // Cinematic Intro Fly-In
      map.flyTo({ 
        center: [80.7718, 7.8731], 
        zoom: 6.8, 
        pitch: 45, 
        duration: 3000, 
        essential: true,
        padding: { top: 80, bottom: 20, left: 20, right: 20 } // Responsive padding for top filter bar
      })
    })

    mapInstance.current = map

    return () => {
      mapInstance.current?.remove()
      mapInstance.current = null
    }
  }, []) // Empty dependency array guarantees it never tears down on state changes

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

  // Initialize Markers ONCE
  useEffect(() => {
    if (!mapInstance.current) return
    const map = mapInstance.current

    // Only create markers if we haven't already
    if (Object.keys(markersRef.current).length === 0 && tours.length > 0) {
      tours.forEach(tour => {
        const coords = getTourCoordinates(tour.latitude, tour.longitude, tour.location)
        if (!coords) return

        const el = document.createElement('div')
        
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          handleMarkerClick({ ...tour, coords })
        })

        const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([coords.lng, coords.lat])
          .addTo(map)

        markersRef.current[tour.id] = { marker, el, tour, coords }
      })
    }
  }, [tours, handleMarkerClick])

  // Update Marker Visibilities and Classes dynamically WITHOUT re-creation
  useEffect(() => {
    Object.values(markersRef.current).forEach(({ el, tour }) => {
      // Filter logic
      const isVisible = activeCategory === "All" || tour.category.toLowerCase().includes(activeCategory.toLowerCase())
      el.style.display = isVisible ? 'block' : 'none'

      // Selection logic
      const isSelected = selectedTour?.id === tour.id
      
      // Update DOM safely WITHOUT overwriting mapboxgl-marker root classes
      const innerClass = `relative group cursor-pointer transition-all duration-300 ease-out transform origin-bottom ${isSelected ? 'scale-125 z-50' : 'scale-100 hover:scale-110 z-10'}`

      el.innerHTML = `
        <div class="${innerClass}">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-colors ${isSelected ? 'bg-rose-500 text-white' : 'bg-white text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white'}">
            $${tour.price_usd}
          </div>
          <div class="w-14 h-14 rounded-full overflow-hidden border-2 shadow-lg transition-colors ${isSelected ? 'border-rose-500' : 'border-white'}">
            <img src="${tour.cover_image_url}" alt="${tour.title}" class="w-full h-full object-cover" />
          </div>
          <div class="w-3 h-3 absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45 transition-colors ${isSelected ? 'bg-rose-500' : 'bg-white'}"></div>
        </div>
      `
    })
  }, [activeCategory, selectedTour])

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

      {/* Strict isolation for Mapbox Canvas */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Render the drawer completely outside the map canvas layer */}
      <MapPreviewDrawer 
        tour={selectedTour} 
        onClose={() => setSelectedTour(null)} 
      />

    </div>
  )
}
