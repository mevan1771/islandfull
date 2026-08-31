"use client"

import { useEffect } from "react"

export function MobilePaddingSetter() {
    useEffect(() => {
        // Add class on mount
        document.body.classList.add('mobile-booking-padding')

        // Remove class on unmount
        return () => {
            document.body.classList.remove('mobile-booking-padding')
        }
    }, [])

    return null
}
