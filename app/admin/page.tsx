import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import BookingsClient from "@/components/admin/BookingsClient"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const { data: bookings, error } = await supabaseAdmin
    .from('bookings')
    .select('*, activities(title)')
    .neq('is_archived', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        

        <BookingsClient initialBookings={bookings || []} />
      </div>
    </div>
  )
}

