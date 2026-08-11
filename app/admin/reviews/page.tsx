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

        

        <ReviewManagement activities={activities || []} />
      </div>
    </div>
  )
}

