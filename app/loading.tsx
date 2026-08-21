"use client"

import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

export default function Loading() {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setShow(true), 300)
        return () => clearTimeout(timer)
    }, [])

    if (!show) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        </div>
    )
}
