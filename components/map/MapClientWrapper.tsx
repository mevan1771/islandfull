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
    const lastCompactTarget = useRef("")
    const [mapReady, setMapReady] = useState(false)

    const flyToLocation = useCallback((location: { lat: number, lng: number, zoom?: number, bounds?: [[number, number], [number, number]] }) => {
        const map = mapRef.current
        if (!map) return
        const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
        if (compact) {
            const targetKey = location.bounds
                ? `b:${location.bounds[0][0]},${location.bounds[0][1]},${location.bounds[1][0]},${location.bounds[1][1]}`
                : `${location.lat.toFixed(4)},${location.lng.toFixed(4)},${location.zoom ?? 9.2}`
            if (lastCompactTarget.current === targetKey && (map.isMoving() || map.isEasing())) return
            lastCompactTarget.current = targetKey
            if (location.bounds) {
                map.fitBounds(location.bounds, {
                    padding: { top: 36, bottom: 36, left: 28, right: 28 },
                    duration: 2000,
                    essential: true,
                    maxZoom: 6.4,
                    easing: ease,
                })
                return
            }
            map.easeTo({
                center: [location.lng, location.lat],
                zoom: location.zoom ?? 9.2,
                duration: 2200,
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
            className="relative h-full w-full min-h-0 flex-1 overscroll-none"
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
            {compact && mapReady ? (
                <div className="absolute bottom-3 right-3 z-20 flex flex-col overflow-hidden rounded-xl border border-white/20 bg-white/95 shadow-lg">
                    <button
                        type="button"
                        aria-label="Zoom in"
                        className="flex h-8 w-8 items-center justify-center text-base font-semibold text-zinc-800 hover:bg-zinc-100"
                        onClick={() => mapRef.current?.zoomIn({ duration: 280 })}
                    >
                        +
                    </button>
                    <span className="h-px bg-zinc-200" />
                    <button
                        type="button"
                        aria-label="Zoom out"
                        className="flex h-8 w-8 items-center justify-center text-base font-semibold text-zinc-800 hover:bg-zinc-100"
                        onClick={() => mapRef.current?.zoomOut({ duration: 280 })}
                    >
                        −
                    </button>
                </div>
            ) : null}
        </div>
    )
}
