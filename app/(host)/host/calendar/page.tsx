import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import CalendarClient from './CalendarClient'
import SignOutButton from '@/components/host/SignOutButton'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function HostCalendarPage() {
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

  // Get host profile
  const { data: host } = await supabase
    .from('hosts')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  let activities: { id: string, title: string }[] = []
  
  if (host) {
    const { data } = await supabase
      .from('activities')
      .select('id, title')
      .eq('host_id', host.id)
      
    if (data) activities = data
  }

  const activityIds = activities.map(a => a.id)

  // Fetch blocked dates for these activities
  let activityBlocks: any[] = []
  if (activityIds.length > 0) {
    const { data } = await supabase
      .from('activity_blocks')
      .select('activity_id, blocked_date')
      .in('activity_id', activityIds)
      
    if (data) activityBlocks = data
  }

  // Fetch confirmed/pending/completed bookings to show as booked dates
  let bookings: any[] = []
  if (activityIds.length > 0) {
    const { data } = await supabase
      .from('bookings')
      .select('travel_date')
      .in('activity_id', activityIds)
      .in('status', ['pending', 'confirmed', 'completed', 'redeemed', 'pending_payment'])
      
    if (data) bookings = data
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 pb-24">
      {/* Header */}
      <header className="bg-zinc-900 text-white p-6 sticky top-0 z-10 shadow-md flex justify-between items-start w-full mb-6">
        <div className="flex gap-4 items-center">
          <Link href="/host" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Availability Calendar</h1>
            <p className="text-sm text-zinc-400">{host?.name || "Operations"}</p>
          </div>
        </div>
        <div>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Block Availability</h2>
          <p className="text-zinc-500">Tap any date on the calendar to block it. Customers will not be able to book activities on blocked dates. Tap again to unblock.</p>
        </div>

        <CalendarClient 
          activities={activities}
          activityBlocks={activityBlocks}
          bookings={bookings}
        />
      </main>
    </div>
  )
}
