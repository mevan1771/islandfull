import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="w-full min-h-screen bg-white pb-32 md:pb-12">
      <div className="relative h-[35vh] md:h-[600px] m-3 sm:m-0 md:mx-auto md:w-full md:mt-6 max-w-[1400px] rounded-2xl sm:rounded-3xl bg-zinc-100 animate-pulse"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Main Content Skeleton */}
          <div className="flex-1 space-y-6">
            <div className="h-10 w-3/4 bg-zinc-100 rounded-lg animate-pulse"></div>
            <div className="h-6 w-1/3 bg-zinc-100 rounded-lg animate-pulse"></div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-zinc-100">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="h-4 w-1/2 bg-zinc-100 rounded animate-pulse"></div>
                  <div className="h-5 w-3/4 bg-zinc-100 rounded animate-pulse"></div>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="h-4 w-full bg-zinc-100 rounded animate-pulse"></div>
              <div className="h-4 w-full bg-zinc-100 rounded animate-pulse"></div>
              <div className="h-4 w-5/6 bg-zinc-100 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Sidebar Skeleton */}
          <div className="w-full lg:w-[400px] flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 bg-white border border-zinc-100 p-6 rounded-3xl shadow-xl h-[400px] flex flex-col items-center justify-center gap-4">
               <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
               <p className="text-sm text-zinc-400 font-medium">Loading details...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
