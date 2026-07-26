"use client"

import { useState } from "react"
import { addReview, updateReview, deleteReview } from "@/app/actions/reviews"
import { Star, MessageSquare, User, Loader2, Trash2, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"

export function ReviewManagement({ activities }: { activities: any[] }) {
  const [selectedActivityId, setSelectedActivityId] = useState<string>("")
  const [editingReview, setEditingReview] = useState<any | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{type: 'success' | 'error', msg: string} | null>(null)
  
  // Find currently selected activity to render its reviews
  const selectedActivity = activities.find(a => a.id === selectedActivityId)
  const currentReviews = selectedActivity?.reviews || []

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatusMsg(null)

    const formData = new FormData(e.currentTarget)
    
    let result;
    if (editingReview) {
      result = await updateReview(editingReview.id, formData)
    } else {
      result = await addReview(formData)
    }

    if (result.success) {
      setStatusMsg({ type: 'success', msg: editingReview ? "Review updated successfully!" : "Review added successfully!" })
      if (!editingReview) {
        e.currentTarget.reset()
      } else {
        setEditingReview(null)
      }
      router.refresh()
    } else {
      setStatusMsg({ type: 'error', msg: result.error || "Failed to save review." })
    }
    
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    const result = await deleteReview(id)
    if (result.success) {
      setStatusMsg({ type: 'success', msg: "Review deleted." })
      if (editingReview?.id === id) setEditingReview(null)
      router.refresh()
    } else {
      setStatusMsg({ type: 'error', msg: result.error || "Failed to delete review." })
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form */}
      <div className="lg:col-span-5">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">
          {editingReview ? "Edit Review" : "Add New Review"}
        </h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
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
              value={selectedActivityId}
              onChange={(e) => {
                setSelectedActivityId(e.target.value)
                setEditingReview(null)
              }}
              disabled={!!editingReview}
              className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-lg text-zinc-900 bg-white disabled:bg-zinc-100 disabled:text-zinc-500"
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
              defaultValue={editingReview?.guest_name || ""}
              key={editingReview?.id || "new-name"}
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
              defaultValue={editingReview?.rating || "5"}
              key={editingReview?.id || "new-rating"}
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
              defaultValue={editingReview?.comment || ""}
              key={editingReview?.id || "new-comment"}
              rows={4}
              className="w-full p-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-medium text-lg text-zinc-900 placeholder:text-zinc-300 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 h-14 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-2xl shadow-xl shadow-zinc-900/20 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingReview ? "Update Review" : "Submit Review"}
            </button>
            {editingReview && (
              <button 
                type="button" 
                onClick={() => setEditingReview(null)}
                className="px-6 h-14 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-2xl transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Right Column: Existing Reviews */}
      <div className="lg:col-span-7">
        <h2 className="text-xl font-bold text-zinc-900 mb-6">
          Existing Reviews {selectedActivityId ? `(${currentReviews.length})` : ""}
        </h2>
        
        {!selectedActivityId ? (
          <div className="bg-zinc-50 border border-zinc-200 border-dashed rounded-3xl p-12 text-center">
            <Star className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">Select a tour on the left to view its reviews.</p>
          </div>
        ) : currentReviews.length === 0 ? (
          <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-12 text-center">
            <p className="text-zinc-500 font-medium">No reviews found for this tour.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 pb-4">
            {currentReviews.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((review: any) => (
              <div key={review.id} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-zinc-900">{review.guest_name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-zinc-100 text-zinc-200'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-zinc-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingReview(review)}
                        className="p-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 rounded-lg transition-colors"
                        title="Edit Review"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(review.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-zinc-600 text-sm leading-relaxed bg-zinc-50/50 p-3 rounded-xl border border-zinc-100">
                    "{review.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
