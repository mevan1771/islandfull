"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import type { Map as MapboxMap } from "mapbox-gl"
import type { MapTour } from "@/components/map/InteractiveMap"

const InteractiveMap = dynamic(() => import("@/components/map/InteractiveMap").then(mod => mod.InteractiveMap), { ssr: false })

interface MapClientWrapperProps {
    tours: MapTour[]
    dynamicCategories?: any[]
    currentVertical?: string
    isDestinationMode?: boolean
    compact?: boolean
    activeTourId?: string | null
    activeLocation?: { lat: number, lng: number, zoom?: number, bounds?: [[number, number], [number, number]] } | null
    resizeToken?: string | number
    onTourSelect?: (tour: MapTour) => void
    captureWheel?: boolean
}

export function MapClientWrapper({ tours, dynamicCategories = [], currentVertical = "all", isDestinationMode = false, compact = false, activeTourId = null, activeLocation = null, resizeToken, onTourSelect, captureWheel = true }: MapClientWrapperProps) {
    const rootRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<MapboxMap | null>(null)
    const [mapReady, setMapReady] = useState(false)

    const flyToLocation = useCallback((location: { lat: number, lng: number, zoom?: number, bounds?: [[number, number], [number, number]] }) => {
        const map = mapRef.current
        if (!map) return
        const ease = (t: number) => 1 - (1 - t) * (1 - t)
        if (compact) {
            if (location.bounds) {
                map.fitBounds(location.bounds, {
                    padding: { top: 36, bottom: 36, left: 28, right: 28 },
                    duration: 1600,
                    essential: true,
                    maxZoom: 6.4,
                    easing: ease,
                })
                return
            }
            map.easeTo({
                center: [location.lng, location.lat],
                zoom: location.zoom ?? 9.2,
                duration: 1800,
                essential: true,
                easing: ease,
            })
            return
        }
        map.stop()
        if (location.bounds) {
            map.fitBounds(location.bounds, {
                padding: { top: 36, bottom: 36, left: 28, right: 28 },
                duration: 1200,
                essential: true,
                maxZoom: 6.4,
            })
            return
        }
        map.flyTo({
            center: [location.lng, location.lat],
            zoom: location.zoom ?? 9.2,
            duration: 2800,
            essential: true,
            curve: 1.8,
            easing: (t) => 1 - Math.pow(1 - t, 3),
        })
    }, [compact])

    const handleMapReady = useCallback((map: MapboxMap | null) => {
        mapRef.current = map
        setMapReady(!!map)
    }, [])

    useEffect(() => {
        if (!activeLocation || !mapReady) return
        const map = mapRef.current
        if (!map) return

        if (compact) {
            flyToLocation(activeLocation)
            return
        }

        let cancelled = false
        map.stop()

        const startFly = () => {
            if (cancelled) return
            const { width, height } = map.getContainer().getBoundingClientRect()
            map.resize()
            if (width < 40 || height < 40) {
                window.setTimeout(startFly, 80)
                return
            }
            flyToLocation(activeLocation)
        }

        const timeout = window.setTimeout(startFly, 350)

        return () => {
            cancelled = true
            window.clearTimeout(timeout)
        }
    }, [activeLocation, resizeToken, mapReady, flyToLocation, compact])

    useEffect(() => {
        if (!captureWheel) return
        const el = rootRef.current
        if (!el) return

        const onWheel = (event: WheelEvent) => {
            event.preventDefault()
        }

        el.addEventListener("wheel", onWheel, { passive: false, capture: true })

        return () => {
            el.removeEventListener("wheel", onWheel, { capture: true } as EventListenerOptions)
        }
    }, [captureWheel])

    return (
        <div
            ref={rootRef}
            className="relative h-full w-full min-h-0 flex-1 overscroll-contain"
            data-lenis-prevent
        >
            <InteractiveMap
                tours={tours}
                dynamicCategories={dynamicCategories}
                currentVertical={currentVertical}
                isDestinationMode={isDestinationMode}
                compact={compact}
                activeTourId={activeTourId}
                onTourSelect={onTourSelect}
                onMapReady={handleMapReady}
            />
        </div>
    )
}
