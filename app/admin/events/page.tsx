import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Plus } from "lucide-react"
import { AdminActivitiesTable } from "@/components/admin/AdminActivitiesTable"

export const dynamic = 'force-dynamic';

export default async function AdminEventsDashboard() {
  const { data: tours } = await supabase
    .from('activities')
    .select('*, categories(name), hosts(name, phone, email, contact_name)')
    .eq('category_type', 'event')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Events</h1>
            <p className="text-zinc-500 mt-1">Manage your event catalog and onboard new organizers.</p>
          </div>
          <Link
            href="/admin/tours/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Event
          </Link>
        </div>

        <AdminActivitiesTable
          items={tours || []}
          kind="event"
          emptyMessage='No events found. Click "Add New Event" to create one.'
        />
      </div>
    </div>
  )
}
