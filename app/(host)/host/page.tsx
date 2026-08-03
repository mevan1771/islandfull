import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import HostDashboardClient from './HostDashboardClient'
import { hostLogout } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'

export default async function HostDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/host/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // Get today's bookings for this host
  const today = new Date().toISOString().split('T')[0]
  
  // Get host profile for this user
  const { data: host } = await supabase
    .from('hosts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let activityIds: string[] = []

  if (host) {
    const { data: activities } = await supabase
      .from('activities')
      .select('id')
      .eq('host_id', host.id)
    
    activityIds = activities?.map(a => a.id) || []
  }

  let expectedGuests = 0
  let pendingArrival = 0
  let arrived = 0

  if (activityIds.length > 0) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('pax_count, status')
      .in('activity_id', activityIds)
      .eq('travel_date', today)

    if (bookings) {
      bookings.forEach(b => {
        if (b.status === 'confirmed' || b.status === 'completed' || b.status === 'redeemed' || b.status === 'pending_payment') {
          expectedGuests += b.pax_count
        }
        if (b.status === 'confirmed' || b.status === 'completed' || b.status === 'pending_payment') {
          pendingArrival += b.pax_count
        }
        if (b.status === 'redeemed') {
          arrived += b.pax_count
        }
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Header */}
      <header className="bg-zinc-900 text-white p-6 sticky top-0 z-10 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Today's Operations</h1>
          <p className="text-zinc-400 text-sm">Welcome back, {profile?.full_name}</p>
        </div>
        <form action={hostLogout}>
          <button type="submit" className="p-2 bg-zinc-800 rounded-full text-zinc-300 hover:text-white transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </header>

      {/* Metrics */}
      <main className="flex-1 p-6 space-y-4">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Live Metrics</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col justify-center">
            <span className="text-zinc-500 text-sm font-medium mb-1">Expected Guests</span>
            <span className="text-3xl font-black text-zinc-900">{expectedGuests}</span>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-2xl shadow-sm border border-amber-100 flex flex-col justify-center">
            <span className="text-amber-700 text-sm font-medium mb-1">Pending Arrival</span>
            <span className="text-3xl font-black text-amber-600">{pendingArrival}</span>
          </div>

          <div className="bg-green-50 p-4 rounded-2xl shadow-sm border border-green-100 flex flex-col justify-center col-span-2">
            <span className="text-green-700 text-sm font-medium mb-1">Arrived (Scanned)</span>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-green-600">{arrived}</span>
              <span className="text-green-600/80 font-bold mb-1">{expectedGuests > 0 ? Math.round((arrived / expectedGuests) * 100) : 0}% Complete</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
            <p className="text-sm text-zinc-500 text-center">Data automatically refreshes when you scan a ticket.</p>
        </div>
      </main>

      {/* Scanner CTA */}
      <HostDashboardClient />
    </div>
  )
}
