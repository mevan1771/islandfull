"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  category_type?: string
  latitude?: number | null
  longitude?: number | null
  rating?: number
}

interface InteractiveMapProps {
  tours: MapTour[]
  dynamicCategories?: any[]
  currentVertical?: string
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Create a type to hold our stable marker references
interface MarkerRef {
  marker: mapboxgl.Marker
  el: HTMLDivElement
  tour: MapTour
  coords: { lat: number, lng: number }
}

export function InteractiveMap({ tours, dynamicCategories = [], currentVertical = 'all' }: InteractiveMapProps) {
  const router = useRouter()
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [id: string]: MarkerRef }>({})
  
  const [selectedTour, setSelectedTour] = useState<MapTour | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")

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

      const isMobile = window.innerWidth < 768;
      
      // Cinematic Intro Fly-In
      map.flyTo({ 
        center: [80.7718, 7.8731], 
        zoom: isMobile ? 6.4 : 6.8, // Zoomed in a bit more on mobile
        pitch: 0, // Flat top-down view
        duration: 3000, 
        essential: true,
        padding: { top: 80, bottom: 20, left: 20, right: 20 }
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
      zoom: 11, // Slightly wider zoom on marker click
      pitch: 0, // Flat top-down view
      duration: 2000, 
      essential: true,
      offset: [0, -150] // Shift camera center up so the marker sits cleanly above the preview drawer
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
      // Filter logic (using slugs)
      const isVisible = activeCategory === "all" || activeCategory === "saved" || tour.category === activeCategory
      el.style.display = isVisible ? 'block' : 'none'

      // Selection logic
      const isSelected = selectedTour?.id === tour.id
      
      // Update DOM safely WITHOUT overwriting mapboxgl-marker root classes
      const innerClass = `relative group cursor-pointer transition-all duration-300 ease-out transform origin-bottom ${isSelected ? 'scale-125 z-[101]' : 'scale-100 hover:scale-110 z-10'}`

      let markerHTML = '';
      if (tour.category_type === 'event') {
        markerHTML = `
          <div class="${innerClass}">
            <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white'}">
              $${tour.price_usd}
            </div>
            <div class="w-12 h-12 bg-white rounded-xl shadow-lg flex flex-col items-center justify-center border-2 transition-colors ${isSelected ? 'border-indigo-500' : 'border-zinc-200'}">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
            </div>
            <div class="w-3 h-3 absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45 transition-colors ${isSelected ? 'bg-indigo-500' : 'bg-white'}"></div>
          </div>
        `
      } else if (tour.category_type === 'transport') {
        markerHTML = `
          <div class="${innerClass}">
             <div class="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-colors ${isSelected ? 'bg-emerald-500 text-white' : 'bg-white text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white'}">
              $${tour.price_usd}
            </div>
            <div class="w-12 h-12 bg-zinc-900 rounded-full shadow-lg flex items-center justify-center border-2 transition-colors ${isSelected ? 'border-emerald-500' : 'border-white'}">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H5a2 2 0 0 0-2 2v7.55a1 1 0 0 0 1 1h2m14 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0m-10 0a2 2 0 1 1-4 0m4 0a2 2 0 1 0-4 0"/></svg>
            </div>
             <div class="w-3 h-3 absolute -bottom-1 left-1/2 -translate-x-1/2 rotate-45 transition-colors ${isSelected ? 'bg-emerald-500' : 'bg-zinc-900'}"></div>
          </div>
        `
      } else {
        // tour style (default)
        markerHTML = `
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
      }

      el.innerHTML = markerHTML
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
    <div className="relative w-full h-[calc(100dvh-60px)] md:h-[calc(100vh-80px)] overflow-hidden bg-zinc-900">
      


      {/* Category Filter Bar (Floating on bottom) */}
      <MapFilterBar 
        activeCategory={activeCategory} 
        onCategoryChange={setActiveCategory} 
        isTourSelected={!!selectedTour}
        dynamicCategories={dynamicCategories}
        currentVertical={currentVertical}
        onVerticalChange={(v) => router.push('?vertical=' + v)}
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
