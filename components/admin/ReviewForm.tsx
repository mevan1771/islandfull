"use client"

import { useState } from "react"
import { addReview } from "@/app/actions/reviews"
import { Star, MessageSquare, User, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export function ReviewForm({ activities }: { activities: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', msg: string} | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatusMsg(null)

    const formData = new FormData(e.currentTarget)
    const result = await addReview(formData)

    if (result.success) {
      setStatusMsg({ type: 'success', msg: "Review added successfully!" })
      e.currentTarget.reset()
      router.refresh()
    } else {
      setStatusMsg({ type: 'error', msg: result.error || "Failed to add review." })
    }
    
    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm max-w-2xl space-y-6">
      {statusMsg && (
        <div className={`p-4 rounded-xl text-sm font-bold ${
          statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {statusMsg.msg}
        </div>
      )}

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
          <Star className="w-4 h-4 text-rose-500" />
          Select Tour
        </label>
        <select 
          name="activity_id"
          required
          className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-lg text-zinc-900 bg-white"
        >
          <option value="">Select a tour...</option>
          {activities.map(act => (
            <option key={act.id} value={act.id}>{act.title}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
          <User className="w-4 h-4 text-rose-500" />
          Guest Name
        </label>
        <input 
          type="text" 
          name="guest_name" 
          required
          placeholder="e.g. Sarah M."
          className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-lg text-zinc-900 placeholder:text-zinc-300"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
          <Star className="w-4 h-4 text-rose-500" />
          Rating (1-5)
        </label>
        <select 
          name="rating"
          required
          defaultValue="5"
          className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-lg text-zinc-900 bg-white"
        >
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very Good</option>
          <option value="3">3 - Average</option>
          <option value="2">2 - Poor</option>
          <option value="1">1 - Terrible</option>
        </select>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
          <MessageSquare className="w-4 h-4 text-rose-500" />
          Comment (Optional)
        </label>
        <textarea 
          name="comment" 
          placeholder="What did they say?"
          rows={4}
          className="w-full p-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 placeholder:text-zinc-300 resize-none"
        />
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl shadow-xl shadow-zinc-900/20 transition-all flex items-center justify-center gap-2"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Review"}
      </button>
    </form>
  )
}
