"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { toggleFeaturedStatus } from "@/app/actions/tours"

export function FeaturedToggle({ id, initialStatus }: { id: string, initialStatus: boolean }) {
  const [isFeatured, setIsFeatured] = useState(initialStatus)
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async () => {
    setIsPending(true)
    const expectedNewStatus = !isFeatured
    
    // Optimistic UI update
    setIsFeatured(expectedNewStatus)
    
    try {
      const result = await toggleFeaturedStatus(id, expectedNewStatus)
      if (!result.success) {
        // Revert if failed
        setIsFeatured(isFeatured)
        alert("Failed to update featured status")
      }
    } catch (e) {
      // Revert if failed
      setIsFeatured(isFeatured)
      console.error(e)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      title={isFeatured ? "Unfeature Activity" : "Feature this Activity (Pin to top)"}
      className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full transition-all active:scale-95 ${
        isFeatured 
          ? 'bg-yellow-50 border border-yellow-200 hover:bg-yellow-100' 
          : 'bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 hover:border-yellow-400 group'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <Star className={`w-3.5 h-3.5 transition-colors ${
        isFeatured 
          ? 'fill-yellow-500 text-yellow-500' 
          : 'text-zinc-300 group-hover:text-yellow-400 group-hover:fill-yellow-400/30'
      }`} />
    </button>
  )
}
