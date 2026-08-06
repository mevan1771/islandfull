"use client"

import { useOptimistic, startTransition } from "react"
import Image from "next/image"
import { Eye, MapMap, Info } from "lucide-react"
import { toggleActivityPauseState } from "@/app/actions/tours"

interface Tour {
  id: string
  title: string
  status: string
  is_paused_by_host: boolean
  view_count: number
  price_usd: number
  card_image_url: string
  cover_image_url: string
}

export default function ToursListClient({ initialActivities }: { initialActivities: Tour[] }) {
  const [optimisticTours, setOptimisticTours] = useOptimistic(
    initialActivities,
    (state, { id, isPaused }: { id: string, isPaused: boolean }) => {
      return state.map(tour => 
        tour.id === id ? { ...tour, is_paused_by_host: isPaused } : tour
      )
    }
  )

  const handleToggle = async (id: string, currentPausedState: boolean) => {
    const newPausedState = !currentPausedState
    
    startTransition(() => {
      setOptimisticTours({ id, isPaused: newPausedState })
    })

    const result = await toggleActivityPauseState(id, newPausedState)
    if (!result.success) {
      // Revert optimistic update if needed, but Next.js will auto-revert on action error
      // or we can just let revalidatePath handle the refresh
      alert(result.error || "Failed to update listing")
    }
  }

  if (optimisticTours.length === 0) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center justify-center text-center">
        <h3 className="text-xl font-bold text-zinc-900 mb-2">No Tours Found</h3>
        <p className="text-zinc-500 max-w-sm">You haven't listed any tours yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {optimisticTours.map(tour => {
        const imageUrl = tour.card_image_url || tour.cover_image_url || '/placeholder.jpg'
        const isLive = tour.status === 'published' && !tour.is_paused_by_host
        
        return (
          <div key={tour.id} className="bg-white rounded-2xl p-4 shadow-sm border border-zinc-100 flex flex-col sm:flex-row gap-4 transition-all">
            <div className="flex gap-4 flex-1 min-w-0">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl overflow-hidden bg-zinc-100">
                <Image 
                  src={imageUrl}
                  alt={tour.title}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isLive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    {isLive ? 'Live' : 'Hidden'}
                  </span>
                </div>
                
                <h3 className="font-bold text-zinc-900 text-base md:text-lg truncate">
                  {tour.title}
                </h3>
                
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm font-bold text-zinc-900">${tour.price_usd}</span>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-sm font-medium">
                    <Eye className="w-4 h-4" />
                    <span>{tour.view_count || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-zinc-100 pt-4 sm:pt-0 sm:pl-4 mt-2 sm:mt-0 gap-3">
              <label className="flex items-center gap-3 cursor-pointer relative">
                <span className="text-sm font-semibold text-zinc-700">Pause Listing</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={tour.is_paused_by_host}
                    onChange={() => handleToggle(tour.id, tour.is_paused_by_host)}
                  />
                  <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </div>
              </label>
              
              {tour.status !== 'published' && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  <Info className="w-3 h-3 shrink-0" />
                  Admin Review Pending
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
