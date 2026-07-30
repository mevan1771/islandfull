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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
            Guest Reviews 
            <span className="font-normal text-sm">⭐ {avgRating.toFixed(1)} ({reviews.length})</span>
          </h2>
        </div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-2 w-full">
          {displayedReviews.map((review) => (
            <div key={review.id} className="w-[80%] sm:w-[280px] flex-shrink-0 snap-align-start bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 text-xs font-bold">
                    {(review.guest_name || 'A').charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-xs font-semibold text-gray-800">{review.guest_name || 'Anonymous'}</h4>
                    <span className="text-[10px] text-gray-400">
                      {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} 
                    />
                  ))}
                </div>
              </div>
              
              {review.comment && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))}
          {reviews.length > 3 && (
            <div 
              onClick={() => setIsModalOpen(true)}
              className="w-[140px] flex-shrink-0 snap-align-start bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-bold text-gray-900 mb-1">See All</span>
              <span className="text-xs text-gray-500">{reviews.length} Reviews</span>
            </div>
          )}
        </div>
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
