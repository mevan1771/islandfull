"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useLenis } from "lenis/react"
import type { Map as MapboxMap } from "mapbox-gl"
import type { MapTour } from "@/components/map/InteractiveMap"

const InteractiveMap = dynamic(() => import("@/components/map/InteractiveMap").then(mod => mod.InteractiveMap), { ssr: false })

interface MapClientWrapperProps {
    tours: MapTour[]
    dynamicCategories?: any[]
    currentVertical?: string
    isDestinationMode?: boolean
    activeLocation?: { lat: number, lng: number } | null
    resizeToken?: string | number
}

export function MapClientWrapper({ tours, dynamicCategories = [], currentVertical = "all", isDestinationMode = false, activeLocation = null, resizeToken }: MapClientWrapperProps) {
    const lenis = useLenis()
    const rootRef = useRef<HTMLDivElement>(null)
    const hoveringRef = useRef(false)
    const mapRef = useRef<MapboxMap | null>(null)
    const [mapReady, setMapReady] = useState(false)

    const flyToLocation = useCallback((location: { lat: number, lng: number }) => {
        const map = mapRef.current
        if (!map) return
        map.stop()
        map.flyTo({
            center: [location.lng, location.lat],
            zoom: 9.2,
            duration: 2800,
            essential: true,
            curve: 1.8,
            easing: (t) => 1 - Math.pow(1 - t, 3),
        })
    }, [])

    const handleMapReady = useCallback((map: MapboxMap | null) => {
        mapRef.current = map
        setMapReady(!!map)
    }, [])

    useEffect(() => {
        if (!activeLocation || !mapReady) return
        const map = mapRef.current
        if (!map) return

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
    }, [activeLocation, resizeToken, mapReady, flyToLocation])

    useEffect(() => {
        const el = rootRef.current
        if (!el) return

        const pausePageScroll = () => {
            hoveringRef.current = true
            lenis?.stop()
        }

        const resumePageScroll = () => {
            hoveringRef.current = false
            lenis?.start()
        }

        const onWheel = (event: WheelEvent) => {
            // Cancel page/Lenis scrolling, but do not stopPropagation so Mapbox still zooms.
            event.preventDefault()
        }

        el.addEventListener("pointerenter", pausePageScroll)
        el.addEventListener("pointerleave", resumePageScroll)
        el.addEventListener("wheel", onWheel, { passive: false, capture: true })

        return () => {
            el.removeEventListener("pointerenter", pausePageScroll)
            el.removeEventListener("pointerleave", resumePageScroll)
            el.removeEventListener("wheel", onWheel, { capture: true } as EventListenerOptions)
            if (hoveringRef.current) {
                lenis?.start()
                hoveringRef.current = false
            }
        }
    }, [lenis])

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
                onMapReady={handleMapReady}
            />
        </div>
    )
}
