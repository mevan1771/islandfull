import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import BookingsListClient from './BookingsListClient'
import { format } from 'date-fns'

export default async function HostBookingsPage() {
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

  let activities: { id: string }[] = []
  
  if (host) {
    const { data } = await supabase
      .from('activities')
      .select('id')
      .eq('host_id', host.id)
      
    if (data) activities = data
  }

  const activityIds = activities.map(a => a.id)

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  let bookings: any[] = []
  if (activityIds.length > 0) {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id,
        tourist_name,
        pax_count,
        travel_date,
        status,
        tour_option,
        activities (
          id,
          title,
          card_image_url,
          cover_image_url
        )
      `)
      .in('activity_id', activityIds)
      .in('status', ['pending', 'confirmed', 'completed', 'redeemed', 'paid', 'pending_payment'])
      .gte('travel_date', todayStr)
      .order('travel_date', { ascending: true })
      
    if (data) bookings = data
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 pb-24">
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Upcoming Bookings</h2>
          <p className="text-zinc-500">Track and manage your upcoming guests.</p>
        </div>

        <BookingsListClient bookings={bookings} />
      </main>
    </div>
  )
}
