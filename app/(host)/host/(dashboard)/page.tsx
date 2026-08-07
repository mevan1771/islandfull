import { createClient } from '@/utils/supabase/server'
import { format } from 'date-fns'
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
  const today = format(new Date(), 'yyyy-MM-dd')
  
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

  // Fallback: If no activities found via host.id, try user.id directly (schema variation)
  if (activityIds.length === 0) {
    const { data: activitiesFallback } = await supabase
      .from('activities')
      .select('id')
      .eq('host_id', user.id)
      
    activityIds = activitiesFallback?.map(a => a.id) || []
  }

  let expectedGuests = 0
  let pendingArrival = 0
  let arrived = 0
  let bookingsData: any[] = []

  if (activityIds.length > 0) {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, tourist_name, pax_count, status, travel_date, tour_option, total_usd, exchange_rate_used, activities(title, card_image_url, cover_image_url)')
      .in('activity_id', activityIds)
      .in('status', ['pending', 'pending_payment', 'confirmed', 'completed', 'redeemed', 'paid'])
      .eq('travel_date', today)
      .order('created_at', { ascending: true })

    console.log("DEBUG TODAY TAB - Host ID:", host?.id, "User ID:", user.id)
    console.log("DEBUG TODAY TAB - Target Date String:", today)
    console.log("DEBUG TODAY TAB - Raw Bookings Query Error:", error)
    console.log("DEBUG TODAY TAB - Raw Bookings Result Count:", bookings?.length)
    console.log("DEBUG TODAY TAB - Raw Bookings Data:", JSON.stringify(bookings, null, 2))

    if (bookings) {
      bookingsData = bookings
      bookings.forEach(b => {
        if (b.status === 'confirmed' || b.status === 'completed' || b.status === 'redeemed' || b.status === 'pending_payment' || b.status === 'paid' || b.status === 'pending') {
          expectedGuests += b.pax_count
        }
        if (b.status === 'confirmed' || b.status === 'completed' || b.status === 'pending_payment' || b.status === 'paid' || b.status === 'pending') {
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
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Confirmed / Paid Arrivals</h2>
          <div className="space-y-3">
            {!bookingsData || bookingsData.filter(b => !['pending', 'pending_payment'].includes(b.status)).length === 0 ? (
              <p className="text-zinc-500 text-sm text-center bg-zinc-100 p-8 rounded-2xl border border-zinc-200">No confirmed bookings for today.</p>
            ) : (
              bookingsData.filter(b => !['pending', 'pending_payment'].includes(b.status)).map(b => {
                const imageUrl = b.activities?.card_image_url || b.activities?.cover_image_url || 'https://images.pexels.com/photos/1243337/pexels-photo-1243337.jpeg?auto=compress&cs=tinysrgb&w=800'
                const fallbackRate = 300 // Fallback if no rate locked
                const rate = b.exchange_rate_used || fallbackRate
                const lkrPrice = b.total_usd * rate
                
                return (
                  <div key={b.id} className="bg-white p-4 rounded-2xl shadow-sm border border-zinc-100 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-zinc-100">
                        <Image 
                          src={imageUrl}
                          alt={b.activities?.title || 'Activity'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-zinc-900 truncate text-sm">{b.tourist_name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-700 whitespace-nowrap ml-2 shrink-0">
                            {b.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {b.activities?.title}
                          {b.tour_option && ` @ ${b.tour_option}`}
                        </div>
                        <div className="text-xs font-semibold text-rose-600 mt-1">
                          {b.pax_count} Guest{b.pax_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100/50">
                      <div className="text-sm font-bold text-zinc-900 bg-zinc-50 px-2.5 py-1 rounded-lg border border-zinc-100">
                        Rs. {lkrPrice.toLocaleString()} <span className="text-zinc-400 font-medium text-xs">/ ${b.total_usd}</span>
                      </div>
                      <ManualCheckInButton bookingId={b.id} status={b.status} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {bookingsData && bookingsData.filter(b => ['pending', 'pending_payment'].includes(b.status)).length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Gate Collection (Unpaid)
            </h2>
            <div className="space-y-3">
              {bookingsData.filter(b => ['pending', 'pending_payment'].includes(b.status)).map(b => {
                const imageUrl = b.activities?.card_image_url || b.activities?.cover_image_url || 'https://images.pexels.com/photos/1243337/pexels-photo-1243337.jpeg?auto=compress&cs=tinysrgb&w=800'
                const fallbackRate = 300 // Fallback if no rate locked
                const rate = b.exchange_rate_used || fallbackRate
                const lkrPrice = b.total_usd * rate
                
                return (
                  <div key={b.id} className="bg-amber-50 p-4 rounded-2xl shadow-sm border border-amber-200 flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="relative w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-zinc-100 border border-amber-200/50">
                        <Image 
                          src={imageUrl}
                          alt={b.activities?.title || 'Activity'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-bold text-zinc-900 truncate text-sm">{b.tourist_name}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-amber-200 text-amber-800 whitespace-nowrap ml-2 shrink-0">
                            Unpaid
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {b.activities?.title}
                          {b.tour_option && ` @ ${b.tour_option}`}
                        </div>
                        <div className="text-xs font-semibold text-rose-600 mt-1">
                          {b.pax_count} Guest{b.pax_count !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-amber-200/50">
                      <div className="text-sm font-bold text-amber-900 bg-amber-200/50 px-2.5 py-1 rounded-lg border border-amber-200/50">
                        Rs. {lkrPrice.toLocaleString()} <span className="text-amber-700/60 font-medium text-xs">/ ${b.total_usd}</span>
                      </div>
                      <ManualCheckInButton bookingId={b.id} status={b.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-8 mb-4">
            <p className="text-sm text-zinc-500 text-center">Data automatically refreshes when you scan a ticket.</p>
        </div>
      </main>

      {/* Scanner CTA */}
      <HostDashboardClient />
    </div>
  )
}
