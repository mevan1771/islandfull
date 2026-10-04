"use client"

import { useEffect } from "react"

export function MobilePaddingSetter({ enabled = true }: { enabled?: boolean }) {
    useEffect(() => {
        if (!enabled) return
        document.body.classList.add('mobile-booking-padding')

        return () => {
            document.body.classList.remove('mobile-booking-padding')
        }
    }, [enabled])

    return null
}
