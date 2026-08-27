"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Menu, Heart } from "lucide-react"

export function GlobalHeader() {
    const router = useRouter()

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm h-16 px-4 flex items-center justify-between">
            {/* Left Section: Back Button */}
            <button
                onClick={(e) => {
                    e.preventDefault()
                    router.back()
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label="Go back"
            >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>

            {/* Center Section: Logo */}
            <Link href="/" className="flex items-center justify-center cursor-pointer">
                <Image
                    src="/logo.png"
                    alt="IslandFull"
                    width={120}
                    height={32}
                    className="h-8 w-auto object-contain"
                    priority
                />
            </Link>

            {/* Right Section: Utility Icons */}
            <div className="flex items-center gap-1">
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Saved items"
                >
                    <Heart className="w-5 h-5 text-gray-700" />
                </button>
                <button
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                    aria-label="Menu"
                >
                    <Menu className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        </header>
    )
}
