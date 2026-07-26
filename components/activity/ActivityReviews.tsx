import { Star, User } from "lucide-react"

interface Review {
  id: string
  guest_name: string
  rating: number
  comment?: string
  created_at: string
}

export function ActivityReviews({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section id="reviews-section" className="mt-16 scroll-mt-24">
      <h2 className="text-3xl font-bold text-zinc-900 mb-8">Guest Reviews</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((review) => (
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
    </section>
  )
}
