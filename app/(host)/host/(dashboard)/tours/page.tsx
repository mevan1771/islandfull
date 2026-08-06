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

  const { data: activitiesData, error } = await supabase
    .from('activities')
    .select('id, title, status, is_paused_by_host, view_count, price_usd, card_image_url, cover_image_url')
    .eq('host_id', user.id)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error("Error fetching host activities:", error)
  }
  
  const activities = activitiesData || []

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
