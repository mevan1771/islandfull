"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { getTourCoordinates } from "@/lib/utils/coordinates"
import { formatUSD } from "@/lib/utils"
import { MapPreviewDrawer } from "./MapPreviewDrawer"
import { MapFilterBar } from "./MapFilterBar"
import { useFavorites } from "@/hooks/useFavorites"

export interface MapTour {
  id: string
  title: string
  slug?: string
  description?: string
  location: string
  inclusions?: string[]
  hostName?: string
  price_usd: number
  cover_image_url: string
  duration: string
  category: string
  category_type?: string
  latitude?: number | null
  longitude?: number | null
  rating?: number
  reviewCount?: number
  tags?: string[]
  created_at?: string | null
  popularity_score?: number | null
  listingHref?: string
}

interface InteractiveMapProps {
  tours: MapTour[]
  dynamicCategories?: any[]
  currentVertical?: string
  isDestinationMode?: boolean
  compact?: boolean
  embed?: boolean
  activeTourId?: string | null
  onTourSelect?: (tour: MapTour) => void
  onMapReady?: (map: mapboxgl.Map | null) => void
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

// Create a type to hold our stable marker references
interface MarkerRef {
  marker: mapboxgl.Marker
  el: HTMLDivElement
  tour: MapTour
  coords: { lat: number, lng: number }
}

export function InteractiveMap({ tours, dynamicCategories = [], currentVertical = 'all', isDestinationMode = false, compact = false, embed = false, activeTourId = null, onTourSelect, onMapReady }: InteractiveMapProps) {
  const router = useRouter()
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [id: string]: MarkerRef }>({})
  const onMapReadyRef = useRef(onMapReady)
  onMapReadyRef.current = onMapReady
  const onTourSelectRef = useRef(onTourSelect)
  onTourSelectRef.current = onTourSelect

  const [selectedTour, setSelectedTour] = useState<MapTour | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [destinationVertical, setDestinationVertical] = useState<string>("all")
  const [mapReady, setMapReady] = useState(false)
  const { favorites } = useFavorites()
  const vertical = isDestinationMode ? destinationVertical : currentVertical
  const barCategories = isDestinationMode
    ? dynamicCategories.filter((category) => category.category_type === destinationVertical)
    : dynamicCategories
  const heroPinsOn = embed || !compact || Boolean(activeTourId)

  // Setup Mapbox STRICTLY ONCE
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainer.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    if (mapInstance.current) return // Map already initialized

    mapContainer.current.replaceChildren()

    const isMobile = window.innerWidth < 768;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [80.7718, 7.7],
      zoom: compact ? 5.8 : isMobile ? 6.4 : 6.8,
      minZoom: 2,
      pitch: 0,
      bearing: 0,
      fadeDuration: compact ? 0 : 300,
      attributionControl: false,
      cooperativeGestures: false
    })

    map.on('load', () => {
      map.resize()
      setMapReady(true)
      onMapReadyRef.current?.(map)
    })

    if (compact) {
      map.scrollZoom.disable()
    } else {
      map.scrollZoom.setWheelZoomRate(1 / 900)
      map.scrollZoom.setZoomRate(1 / 200)
    }

    mapInstance.current = map

    let waitingForIdle = false
    const observer = new ResizeObserver(() => {
      if (compact && (map.isMoving() || map.isEasing())) return
      if (map.isMoving()) {
        if (!waitingForIdle) {
          waitingForIdle = true
          map.once('moveend', () => {
            waitingForIdle = false
            map.resize()
          })
        }
        return
      }
      map.resize()
    })
    observer.observe(mapContainer.current)

    return () => {
      observer.disconnect()
      Object.values(markersRef.current).forEach(({ marker }) => marker.remove())
      markersRef.current = {}
      onMapReadyRef.current?.(null)
      mapInstance.current?.remove()
      mapInstance.current = null
      setMapReady(false)
    }
  }, []) // Empty dependency array guarantees it never tears down on state changes

  const handleMarkerClick = useCallback((tour: MapTour & { coords: { lat: number, lng: number } }) => {
    onTourSelectRef.current?.(tour)
    if (compact) return

    setSelectedTour(tour)

    mapInstance.current?.stop()
    mapInstance.current?.flyTo({
      center: [tour.coords.lng, tour.coords.lat],
      zoom: isDestinationMode ? 12 : embed ? 10 : 11,
      pitch: 0,
      duration: isDestinationMode ? 1400 : 1600,
      essential: true,
      curve: 1.4,
      offset: isDestinationMode ? [0, -160] : [0, -80]
    })
  }, [isDestinationMode, compact, embed])

  // Create / refresh markers whenever the map is ready and tour data arrives
  useEffect(() => {
    if (!mapReady || !mapInstance.current) return
    const map = mapInstance.current

    if (!compact) {
      Object.values(markersRef.current).forEach(({ marker }) => marker.remove())
      markersRef.current = {}
      if (!heroPinsOn) return
    } else {
      const nextIds = new Set(tours.map((tour) => tour.id))
      Object.entries(markersRef.current).forEach(([id, ref]) => {
        if (nextIds.has(id)) return
        ref.marker.remove()
        delete markersRef.current[id]
      })
    }

    tours.forEach(tour => {
      if (compact && markersRef.current[tour.id]) {
        markersRef.current[tour.id].tour = tour
        return
      }
      const coords = getTourCoordinates(tour.latitude, tour.longitude, tour.location, tour.id)
      if (!coords) return

      const el = document.createElement('div')
      el.style.width = '56px'
      el.style.height = '72px'
      el.style.cursor = 'pointer'
      const pinLabel = tour.category_type === "place" ? "Must see" : formatUSD(tour.price_usd)
      const img = tour.cover_image_url
        ? `<img src="${tour.cover_image_url}" alt="" width="52" height="52" />`
        : ""
      el.innerHTML = `
        <div data-if-pin class="if-map-pin">
          <div class="if-map-pin__price">${pinLabel}</div>
          <div class="if-map-pin__dot">${img}</div>
          <div class="if-map-pin__tail"></div>
        </div>
      `
      el.dataset.pinReady = "1"

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        handleMarkerClick({ ...tour, coords })
      })

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([coords.lng, coords.lat])
        .addTo(map)

      markersRef.current[tour.id] = { marker, el, tour, coords }
    })
  }, [tours, handleMarkerClick, mapReady, compact, heroPinsOn])

  useEffect(() => {
    if (!compact) return
    if (!activeTourId) {
      setSelectedTour(null)
      return
    }
    const tour = tours.find((item) => item.id === activeTourId) || null
    setSelectedTour(tour)
  }, [compact, activeTourId, tours])

  // Update Marker Visibilities and Classes dynamically WITHOUT re-creation
  useEffect(() => {
    Object.values(markersRef.current).forEach(({ el, tour }) => {
      // Filter logic (using slugs, favorites, and destination verticals)
      let isVisible = true
      if (isDestinationMode && destinationVertical !== "all") {
        isVisible =
          tour.category_type === destinationVertical ||
          (destinationVertical === "tour" && tour.category_type === "place")
      }
      if (isVisible) {
        if (activeCategory === "all") {
          isVisible = true
        } else if (activeCategory === "saved") {
          isVisible = favorites.includes(tour.id)
        } else {
          isVisible = tour.category === activeCategory || (!!tour.tags && tour.tags.includes(activeCategory))
        }
      }
      const pinsLive = embed || !compact || Boolean(activeTourId)
      el.style.display = isVisible && pinsLive ? 'block' : compact ? 'block' : 'none'
      el.style.opacity = compact ? (pinsLive && isVisible ? '1' : '0') : '1'
      el.style.pointerEvents = compact && !(pinsLive && isVisible) ? 'none' : 'auto'

      // Selection logic
      const isSelected = selectedTour?.id === tour.id

      // Force the root Mapbox marker element to the front if selected
      el.style.zIndex = isSelected ? '1000' : '1'

      if (el.dataset.pinReady === '1') {
        const root = el.querySelector('[data-if-pin]') as HTMLElement | null
        if (root) {
          root.classList.toggle('is-selected', isSelected)
        }
        return
      }

      const pinLabel = tour.category_type === "place" ? "Must see" : formatUSD(tour.price_usd)
      const img = tour.cover_image_url
        ? `<img src="${tour.cover_image_url}" alt="" width="52" height="52" />`
        : ""

      el.innerHTML = `
        <div data-if-pin class="if-map-pin${isSelected ? " is-selected" : ""}">
          <div class="if-map-pin__price">${pinLabel}</div>
          <div class="if-map-pin__dot">${img}</div>
          <div class="if-map-pin__tail"></div>
        </div>
      `
      el.dataset.pinReady = "1"
    })
  }, [activeCategory, selectedTour, favorites, isDestinationMode, destinationVertical, tours, mapReady, heroPinsOn, activeTourId, compact, embed])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full min-h-[240px] flex items-center justify-center bg-zinc-900 text-white">
        <p>Mapbox token is missing in .env.local</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden bg-zinc-900">



      {!compact && !embed && (
      <div className={`absolute inset-0 z-40 pointer-events-none ${isDestinationMode ? "lg:hidden" : ""}`}>
        <MapFilterBar
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          isTourSelected={!!selectedTour}
          dynamicCategories={barCategories}
          currentVertical={vertical}
          onVerticalChange={(v) => {
            if (isDestinationMode) {
              setDestinationVertical(v)
              setActiveCategory("all")
              return
            }
            router.push("?vertical=" + v)
          }}
        />
      </div>
      )}

      {/* Strict isolation for Mapbox Canvas — fill the parent so embed/sidebar layouts get a real size */}
      <div
        ref={mapContainer}
        className="absolute inset-0 h-full w-full"
        style={{
          touchAction: compact ? 'pan-y' : 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      />

      {/* Render the drawer completely outside the map canvas layer */}
      {!compact && (
      <MapPreviewDrawer
        tour={selectedTour}
        onClose={() => setSelectedTour(null)}
        contained={isDestinationMode || embed}
      />
      )}

    </div>
  )
}
