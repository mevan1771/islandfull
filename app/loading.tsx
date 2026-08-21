import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
        </div>
    )
}
