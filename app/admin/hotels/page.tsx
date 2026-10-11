import { supabaseAdmin } from "@/lib/supabase"
import Link from "next/link"
import { Plus } from "lucide-react"
import { AdminHotelsTable } from "@/components/admin/AdminHotelsTable"

export const dynamic = "force-dynamic"

export default async function AdminHotelsPage() {
  const { data: hotels, error } = await supabaseAdmin
    .from("hotels")
    .select("*, hotel_room_types(id, nightly_rate_usd, is_active)")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Hotels</h1>
            <p className="text-zinc-500 mt-1">Properties, room types, occupancy, and nightly rates.</p>
          </div>
          <Link
            href="/admin/hotels/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add hotel
          </Link>
        </div>
        {error ? (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
            Hotels tables are not in the database yet. Apply `supabase/migrations/20261011210000_hotels.sql` and refresh this page.
          </div>
        ) : (
          <AdminHotelsTable items={hotels || []} />
        )}
      </div>
    </div>
  )
}
