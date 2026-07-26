"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { toggleTourStatus } from "@/app/actions/tours"

export function StatusToggle({ id, initialStatus }: { id: string, initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus)
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async () => {
    setIsPending(true)
    const expectedNewStatus = status === 'published' ? 'draft' : 'published'
    
    // Optimistic UI update
    setStatus(expectedNewStatus)
    
    try {
      const result = await toggleTourStatus(id, status)
      if (!result.success) {
        // Revert if failed
        setStatus(status)
        alert("Failed to update status")
      }
    } catch (e) {
      // Revert if failed
      setStatus(status)
      console.error(e)
    } finally {
      setIsPending(false)
    }
  }

  const isPublished = status === 'published'

  return (
    <button 
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all active:scale-95 ${
        isPublished 
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' 
          : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
      }`}
    >
      {isPending ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : isPublished ? (
        <Eye className="w-3.5 h-3.5" />
      ) : (
        <EyeOff className="w-3.5 h-3.5" />
      )}
      {isPublished ? 'PUBLISHED' : 'DRAFT'}
    </button>
  )
}
