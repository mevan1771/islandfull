import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-zinc-50 pt-20 md:pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <p className="text-sm font-medium animate-pulse">Loading tours...</p>
        </div>
      </div>
    </div>
  )
}
