"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { deleteTour } from "@/app/actions/tours"

export function DeleteTourButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to completely delete this tour? This cannot be undone.")) {
      return
    }

    setIsPending(true)
    
    try {
      const result = await deleteTour(id)
      if (!result.success) {
        alert("Failed to delete tour: " + result.error)
      }
    } catch (e) {
      console.error(e)
      alert("An unexpected error occurred.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="inline-flex items-center justify-center p-2 rounded-xl bg-white border border-zinc-200 hover:bg-rose-50 text-zinc-600 hover:text-rose-500 transition-colors shadow-sm disabled:opacity-50"
      title="Delete Tour"
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  )
}
