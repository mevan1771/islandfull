import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { Plus } from "lucide-react"
import { SyncAllButton } from "@/components/admin/SyncAllButton"
import { AdminActivitiesTable } from "@/components/admin/AdminActivitiesTable"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic';

export default async function AdminToursDashboard() {
  const cookieStore = await cookies()
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user } } = await supabaseAuth.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    const { data: userRole } = await supabase.from('user_roles').select('role').eq('user_id', user.id).single()
    isAdmin = (profile?.role === 'admin') || (userRole?.role === 'admin')
  }
  const { data: tours } = await supabase
    .from('activities')
    .select('*, categories(name), hosts(name, phone, email, contact_name)')
    .eq('category_type', 'tour')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Tours</h1>
            <p className="text-zinc-500 mt-1">Manage your tour catalog and onboard new operators.</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && <SyncAllButton />}
            <Link
              href="/admin/tours/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4" />
              Add New Tour
            </Link>
          </div>
        </div>

        <AdminActivitiesTable
          items={tours || []}
          kind="tour"
          emptyMessage='No tours found. Click "Add New Tour" to create one.'
        />
      </div>
    </div>
  )
}
