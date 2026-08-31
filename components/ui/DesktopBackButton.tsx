"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export function DesktopBackButton() {
    const router = useRouter()

    return (
        <button
            onClick={(e) => {
                e.preventDefault()
                router.back()
            }}
            className="flex items-center gap-3 px-5 py-3 bg-zinc-50 hover:bg-zinc-100 transition-colors rounded-2xl border border-zinc-100 flex-shrink-0 cursor-pointer text-left"
        >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <ArrowLeft className="w-5 h-5 text-rose-500" />
            </div>
            <div className="flex flex-col pr-2">
                <span className="text-xs font-bold text-zinc-400 uppercase">Go Back</span>
                <span className="text-base font-semibold text-slate-700/80">Home</span>
            </div>
        </button>
    )
}
