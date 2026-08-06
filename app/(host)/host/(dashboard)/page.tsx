import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import HostDashboardClient from './HostDashboardClient'
import SignOutButton from '@/components/host/SignOutButton'
import ManualCheckInButton from '@/components/host/ManualCheckInButton'
import { hostLogout } from '@/app/actions/auth'
import { LogOut } from 'lucide-react'
import Image from 'next/image'

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

  if (profile?.role !== 'provider' && profile?.role !== 'admin') {
    redirect('/host/login')
  }

  // Get today's bookings for this host
  const today = new Date().toISOString().split('T')[0]
  
  // Get host profile for this user
  const { data: host } = await supabase
    .from('hosts')
    .select('id, name, image_url')
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
  let bookingsData: any[] = []

  if (activityIds.length > 0) {
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, full_name, pax_count, status, activities(title, start_time)')
      .in('activity_id', activityIds)
      .eq('travel_date', today)
      .order('created_at', { ascending: true })

    if (bookings) {
      bookingsData = bookings
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

  const progress = expectedGuests > 0 ? Math.round((arrived / expectedGuests) * 100) : 0

  return (
    <div className="flex flex-col min-h-screen pb-24">
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

          <div className="bg-emerald-50 p-4 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-center col-span-2">
            <div className="flex justify-between items-end mb-3">
              <div className="flex flex-col">
                <span className="text-emerald-700 text-sm font-medium mb-1">Arrived (Scanned)</span>
                <span className="text-4xl font-black text-emerald-600">{arrived}</span>
              </div>
              <span className="text-emerald-600/80 font-bold mb-1">{progress}% Complete</span>
            </div>
            <div className="w-full bg-emerald-200/50 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Today's Roster</h2>
          <div className="space-y-3">
            {!bookingsData || bookingsData.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center bg-zinc-100 p-8 rounded-2xl border border-zinc-200">No bookings scheduled for today.</p>
            ) : (
              bookingsData.map(b => (
                <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex justify-between items-center gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900">{b.full_name}</span>
                    <span className="text-xs text-zinc-500 mt-1">{b.activities?.title} @ {b.activities?.start_time} &bull; {b.pax_count} Guest{b.pax_count !== 1 ? 's' : ''}</span>
                  </div>
                  <ManualCheckInButton bookingId={b.id} status={b.status} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 mb-4">
            <p className="text-sm text-zinc-500 text-center">Data automatically refreshes when you scan a ticket.</p>
        </div>
      </main>

      {/* Scanner CTA */}
      <HostDashboardClient />
    </div>
  )
}
