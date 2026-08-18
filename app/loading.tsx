import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      {/* Hero Skeleton */}
      <div className="w-full relative pt-24 md:pt-32 pb-40 md:pb-48 min-h-[50svh] md:min-h-[85vh] bg-zinc-900 animate-pulse flex flex-col items-center justify-center text-white rounded-b-xl md:rounded-none">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <p className="text-sm font-medium mt-4 text-zinc-400">Loading experiences...</p>
      </div>

      {/* Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 w-full py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-full aspect-[4/3] bg-zinc-100 rounded-2xl animate-pulse"></div>
              <div className="w-3/4 h-4 bg-zinc-100 rounded animate-pulse"></div>
              <div className="w-1/2 h-4 bg-zinc-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
