import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { ReviewManagement } from "@/components/admin/ReviewManagement"

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  const { data: activities, error } = await supabase
    .from('activities')
    .select('id, title, reviews(*)')
    .order('title', { ascending: true });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
            <p className="text-zinc-500 mt-1">Manage concierge reviews for your activities.</p>
          </div>
        </div>

        <div className="flex gap-6 border-b border-zinc-200 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/admin" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Bookings</Link>
          <Link href="/admin/tours" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Tours Database</Link>
          <Link href="/admin/reviews" className="pb-3 border-b-2 border-zinc-900 font-bold text-zinc-900 px-1">Reviews</Link>
          <Link href="/admin/settings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Global Settings</Link>
        </div>

        <ReviewManagement activities={activities || []} />
      </div>
    </div>
  )
}
