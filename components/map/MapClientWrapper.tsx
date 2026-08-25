"use client"

import dynamic from 'next/dynamic'
import type { MapTour } from "@/components/map/InteractiveMap"

const InteractiveMap = dynamic(() => import('@/components/map/InteractiveMap').then(mod => mod.InteractiveMap), { ssr: false })

interface MapClientWrapperProps {
    tours: MapTour[]
    dynamicCategories?: any[]
    currentVertical?: string
}

export function MapClientWrapper({ tours, dynamicCategories = [], currentVertical = 'all' }: MapClientWrapperProps) {
    return (
        <InteractiveMap
            tours={tours}
            dynamicCategories={dynamicCategories}
            currentVertical={currentVertical}
        />
    )
}
