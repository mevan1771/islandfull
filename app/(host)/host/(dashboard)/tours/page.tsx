import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import ToursListClient from './ToursListClient'

export default async function HostToursPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/host/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'provider' && profile?.role !== 'admin') {
    redirect('/host/login')
  }

  const { data: host } = await supabase
    .from('hosts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  console.log("DEBUG TOURS PAGE - user.id:", user.id);
  console.log("DEBUG TOURS PAGE - host result:", host);

  let activities: any[] = []
  
  if (host) {
    const { data, error } = await supabase
      .from('activities')
      .select('id, title, status, is_paused_by_host, view_count, price_usd, card_image_url, cover_image_url')
      .eq('host_id', host.id)
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error("DEBUG TOURS PAGE - Error fetching activities:", error)
    }
    console.log("DEBUG TOURS PAGE - activities result:", data?.length);
    if (data) activities = data
  } else {
    // Fallback: try querying by user.id directly if host profile wasn't found or if schema uses user.id
    console.log("DEBUG TOURS PAGE - No host found, trying user.id directly");
    const { data, error } = await supabase
      .from('activities')
      .select('id, title, status, is_paused_by_host, view_count, price_usd, card_image_url, cover_image_url')
      .eq('host_id', user.id)
      .order('created_at', { ascending: false })
      
    if (error) {
      console.error("DEBUG TOURS PAGE - Error fetching activities (user.id fallback):", error)
    }
    console.log("DEBUG TOURS PAGE - activities result (user.id fallback):", data?.length);
    if (data) activities = data
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 pb-24">
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">My Tours</h2>
          <p className="text-zinc-500">Manage your listings, pause visibility, and track views.</p>
        </div>

        <ToursListClient initialActivities={activities} />
      </main>
    </div>
  )
}
