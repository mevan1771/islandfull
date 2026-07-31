import { supabase } from "@/lib/supabase"
import Link from "next/link"
import BookingsClient from "@/components/admin/BookingsClient"

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, activities(title)')
    .neq('is_archived', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-6 border-b border-zinc-200 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/admin" className="pb-3 border-b-2 border-zinc-900 font-bold text-zinc-900 px-1">Bookings</Link>
          <Link href="/admin/tours" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Tours Database</Link>
          <Link href="/admin/reviews" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Reviews</Link>
          <Link href="/admin/promos" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Promo Codes</Link>
          <Link href="/admin/finances" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Finances</Link>
          <Link href="/admin/earnings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Earnings</Link>
          <Link href="/admin/hosts" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Hosts</Link>
          <Link href="/admin/settings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Global Settings</Link>
        </div>

        <BookingsClient initialBookings={bookings || []} />
      </div>
    </div>
  )
}
