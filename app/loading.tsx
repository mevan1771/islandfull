export default function Loading() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Skeleton */}
      <div className="relative w-full h-[50svh] md:h-[85vh] bg-zinc-200 animate-pulse rounded-b-xl md:rounded-none">
        
        {/* Desktop Search Bar Skeleton */}
        <div className="absolute bottom-[-28px] left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-16 bg-white rounded-full shadow-lg hidden sm:flex items-center px-6">
          <div className="w-1/3 h-4 bg-zinc-100 rounded animate-pulse"></div>
          <div className="w-px h-8 bg-zinc-100 mx-4"></div>
          <div className="w-1/4 h-4 bg-zinc-100 rounded animate-pulse"></div>
          <div className="w-px h-8 bg-zinc-100 mx-4"></div>
          <div className="w-1/4 h-4 bg-zinc-100 rounded animate-pulse"></div>
          <div className="ml-auto w-10 h-10 rounded-full bg-rose-500/20 animate-pulse"></div>
        </div>

      </div>

      {/* Mobile Search Bar Skeleton */}
      <div className="sm:hidden px-4 -mt-12 relative z-20 w-full mb-6">
        <div className="bg-white rounded-xl shadow-md p-3 flex flex-col gap-2">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-zinc-100 mb-2 pb-2">
              <div className="w-16 h-4 bg-zinc-100 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-zinc-100 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-zinc-100 rounded animate-pulse"></div>
            </div>
            {/* Inputs */}
            <div className="h-10 w-full bg-zinc-100 rounded-lg animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-10 flex-1 bg-zinc-100 rounded-lg animate-pulse"></div>
              <div className="h-10 flex-1 bg-zinc-100 rounded-lg animate-pulse"></div>
            </div>
            {/* Button */}
            <div className="flex gap-2 mt-1">
               <div className="h-10 w-10 bg-zinc-100 rounded-lg animate-pulse"></div>
               <div className="h-10 flex-1 bg-rose-500/20 rounded-lg animate-pulse"></div>
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-24">
        
        {/* Category Tabs Skeleton */}
        <div className="flex gap-4 overflow-x-auto py-4 mb-8 hide-scrollbar">
          {[1, 2, 3, 4, 5, 6, 7].map(i => (
            <div key={i} className="flex-shrink-0 w-24 h-10 bg-zinc-100 rounded-full animate-pulse"></div>
          ))}
        </div>

        {/* Tour Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="flex flex-col gap-3">
              {/* Card Image */}
              <div className="w-full aspect-[4/5] bg-zinc-100 rounded-2xl animate-pulse"></div>
              {/* Card Content */}
              <div className="space-y-2 px-1">
                <div className="flex justify-between items-center">
                  <div className="w-2/3 h-4 bg-zinc-100 rounded animate-pulse"></div>
                  <div className="w-8 h-4 bg-zinc-100 rounded animate-pulse"></div>
                </div>
                <div className="w-1/2 h-3 bg-zinc-100 rounded animate-pulse"></div>
                <div className="w-1/3 h-4 bg-zinc-100 rounded animate-pulse mt-2"></div>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  )
}
