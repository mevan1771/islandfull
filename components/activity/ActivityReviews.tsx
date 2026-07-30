"use client"

import { useState } from "react"
import { Star, X } from "lucide-react"

interface Review {
  id: string
  guest_name: string
  rating: number
  comment?: string
  created_at: string
}

export function ActivityReviews({ reviews }: { reviews: Review[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!reviews || reviews.length === 0) return null;

  const sortedReviews = [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const displayedReviews = sortedReviews.slice(0, 6);
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;

  return (
    <>
      <section id="reviews-section" className="scroll-mt-24">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Guest Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedReviews.map((review) => (
            <div key={review.id} className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold">
                    {(review.guest_name || 'A').charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900">{review.guest_name || 'Anonymous'}</h4>
                    <div className="text-xs text-zinc-500 font-medium">
                      {new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-zinc-200 text-zinc-200'}`} 
                    />
                  ))}
                </div>
              </div>
              
              {review.comment && (
                <p className="text-zinc-600 leading-relaxed">
                  "{review.comment}"
                </p>
              )}
            </div>
          ))}
        </div>

        {reviews.length > 6 && (
          <div className="mt-8">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 border border-zinc-900 rounded-xl font-semibold text-zinc-900 hover:bg-zinc-50 transition-colors"
            >
              Show all {reviews.length} reviews
            </button>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-zinc-100 p-6 z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  <span className="text-2xl font-bold text-zinc-900">{avgRating.toFixed(1)}</span>
                </div>
                <span className="text-xl font-medium text-zinc-500">·</span>
                <span className="text-xl font-bold text-zinc-900">{reviews.length} reviews</span>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
              >
                <X className="w-6 h-6 text-zinc-900" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 md:p-8 overflow-y-auto">
              <div className="flex flex-col gap-8">
                {sortedReviews.map((review) => (
                  <div key={review.id} className="border-b border-zinc-100 pb-8 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 font-bold text-lg">
                        {(review.guest_name || 'A').charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-900 text-lg">{review.guest_name || 'Anonymous'}</h4>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium mt-0.5">
                          <span>{new Date(review.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                          <span>·</span>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-zinc-200 text-zinc-200'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {review.comment && (
                      <p className="text-zinc-700 leading-relaxed text-lg">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
