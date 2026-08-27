"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Menu, Heart } from "lucide-react"

export function GlobalHeader() {
    const router = useRouter()

    return (
        <header className="md:hidden absolute top-0 left-0 w-full z-50 flex items-center justify-between p-4 bg-transparent">
            {/* Left Section: Back Button */}
            <button
                onClick={(e) => {
                    e.preventDefault()
                    router.back()
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/40 transition-colors cursor-pointer"
                aria-label="Go back"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Right Section: Utility Icons */}
            <div className="flex items-center gap-2">
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/40 transition-colors cursor-pointer"
                    aria-label="Saved items"
                >
                    <Heart className="w-5 h-5" />
                </button>
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-black/40 transition-colors cursor-pointer"
                    aria-label="Menu"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>
        </header>
    )
}
