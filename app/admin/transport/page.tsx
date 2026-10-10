import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Plus } from "lucide-react"
import { AdminActivitiesTable } from "@/components/admin/AdminActivitiesTable"

export const dynamic = 'force-dynamic';

export default async function AdminTransportDashboard() {
  const { data: tours } = await supabase
    .from('activities')
    .select('*, categories(name), hosts(name, phone, email, contact_name)')
    .eq('category_type', 'transport')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Transport</h1>
            <p className="text-zinc-500 mt-1">Manage your transport options and onboard new drivers.</p>
          </div>
          <Link
            href="/admin/tours/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add New Transport
          </Link>
        </div>

        <AdminActivitiesTable
          items={tours || []}
          kind="transport"
          emptyMessage='No transport options found. Click "Add New Transport" to create one.'
        />
      </div>
    </div>
  )
}
