"use client"

import { useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { useLenis } from "lenis/react"
import type { MapTour } from "@/components/map/InteractiveMap"

const InteractiveMap = dynamic(() => import("@/components/map/InteractiveMap").then(mod => mod.InteractiveMap), { ssr: false })

interface MapClientWrapperProps {
    tours: MapTour[]
    dynamicCategories?: any[]
    currentVertical?: string
    isDestinationMode?: boolean
}

export function MapClientWrapper({ tours, dynamicCategories = [], currentVertical = "all", isDestinationMode = false }: MapClientWrapperProps) {
    const lenis = useLenis()
    const rootRef = useRef<HTMLDivElement>(null)
    const hoveringRef = useRef(false)

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
            />
        </div>
    )
}
