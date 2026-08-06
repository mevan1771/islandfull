import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import EarningsClient from './EarningsClient'
import { getExchangeRate } from '@/app/actions/settings'

export default async function HostEarningsPage() {
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

  // Get host's bookings
  // We need to fetch bookings for activities owned by this host
  // Like in /host/bookings but only completed/confirmed/redeemed
  
  // First, find activities owned by this user
  const { data: activities } = await supabase
    .from('activities')
    .select('id, title')
    .eq('host_id', user.id)

  let bookings: any[] = []
  
  if (activities && activities.length > 0) {
    const activityIds = activities.map(a => a.id)
    
    // Now fetch valid revenue-generating bookings for these activities
    const { data: bookingsData } = await supabase
      .from('bookings')
      .select('*, activities(title)')
      .in('activity_id', activityIds)
      .in('status', ['confirmed', 'completed', 'redeemed'])
      .order('travel_date', { ascending: false })
      
    if (bookingsData) {
      bookings = bookingsData
    }
  } else {
    // Fallback: check if they have a 'hosts' record (like the tours page fallback)
    const { data: host } = await supabase
      .from('hosts')
      .select('id')
      .eq('user_id', user.id)
      .single()
      
    if (host) {
      const { data: secondaryActivities } = await supabase
        .from('activities')
        .select('id, title')
        .eq('host_id', host.id)
        
      if (secondaryActivities && secondaryActivities.length > 0) {
        const secondaryActivityIds = secondaryActivities.map(a => a.id)
        const { data: fallbackBookings } = await supabase
          .from('bookings')
          .select('*, activities(title)')
          .in('activity_id', secondaryActivityIds)
          .in('status', ['confirmed', 'completed', 'redeemed'])
          .order('travel_date', { ascending: false })
          
        if (fallbackBookings) {
          bookings = fallbackBookings
        }
      }
    }
  }

  // Get current exchange rate for fallback
  const currentGlobalRate = await getExchangeRate()

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 pb-24">
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Earnings</h2>
          <p className="text-zinc-500">Track your revenue, pending payouts, and ledger.</p>
        </div>

        <EarningsClient initialBookings={bookings} currentGlobalRate={currentGlobalRate} />
      </main>
    </div>
  )
}
