import { supabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { CheckCircle2, XCircle, MessageCircle, Clock, CalendarDays, Users } from "lucide-react"

export const dynamic = 'force-dynamic';

async function updateStatus(id: string, newStatus: string) {
  "use server"
  const { supabase: serverSupabase } = await import('@/lib/supabase');
  
  if (newStatus === 'cancelled') {
    const { data: booking } = await serverSupabase.from('bookings').select('activity_id, travel_date').eq('id', id).single();
    if (booking) {
      try {
        const { autoUnblockDate } = await import('@/app/actions/tours');
        await autoUnblockDate(booking.activity_id, booking.travel_date);
      } catch (e) {
        console.error("Failed to unblock date:", e);
      }
    }
  }

  await serverSupabase.from('bookings').update({ status: newStatus }).eq('id', id);
  revalidatePath('/admin');
  revalidatePath('/', 'layout');
}

export default async function AdminDashboard() {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*, activities(title)')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
            <p className="text-zinc-500 mt-1">Manage all live bookings and communicate with guests.</p>
          </div>
          <div className="px-4 py-2 bg-rose-50 rounded-lg text-rose-600 font-semibold border border-rose-100 shadow-sm text-sm">
            Total Bookings: {bookings?.length || 0}
          </div>
        </div>

        <div className="flex gap-6 border-b border-zinc-200 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/admin" className="pb-3 border-b-2 border-zinc-900 font-bold text-zinc-900 px-1">Bookings</Link>
          <Link href="/admin/tours" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Tours Database</Link>
          <Link href="/admin/reviews" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Reviews</Link>
          <Link href="/admin/promos" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Promo Codes</Link>
          <Link href="/admin/finances" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Finances</Link>
          <Link href="/admin/earnings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Earnings</Link>
          <Link href="/admin/hosts" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Hosts</Link>
          <Link href="/admin/settings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Global Settings</Link>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Guest Details</th>
                  <th className="px-6 py-4">Activity</th>
                  <th className="px-6 py-4">Booking Info</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {!bookings || bookings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      No bookings found yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b: any) => (
                    <tr key={b.id} className="hover:bg-zinc-50/50 transition-colors">
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          b.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                          b.status === 'completed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          b.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {b.status === 'confirmed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                           b.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                           b.status === 'cancelled' ? <XCircle className="w-3.5 h-3.5" /> :
                           <Clock className="w-3.5 h-3.5" />}
                          {b.status.toUpperCase()}
                        </span>
                      </td>

                      {/* Guest Details */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-zinc-900">{b.tourist_name}</div>
                        <div className="text-zinc-500">{b.tourist_email}</div>
                      </td>

                      {/* Activity */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-zinc-800 max-w-[200px] truncate" title={b.activities?.title}>
                          {b.activities?.title || 'Unknown Activity'}
                        </div>
                        {b.tour_option && (
                          <div className="text-zinc-500 text-xs font-medium mt-0.5">{b.tour_option}</div>
                        )}
                        <div className="text-rose-500 font-bold mt-0.5">${b.total_usd}</div>
                      </td>

                      {/* Booking Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-zinc-600 mb-1">
                          <CalendarDays className="w-4 h-4 text-zinc-400" />
                          <span className="font-medium">{new Date(b.travel_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-600">
                          <Users className="w-4 h-4 text-zinc-400" />
                          <span className="font-medium">{b.pax_count} Pax</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Status Actions */}
                          {b.status === 'pending' && (
                            <form action={updateStatus.bind(null, b.id, 'confirmed')}>
                              <button type="submit" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200" title="Confirm Booking">
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            </form>
                          )}
                          {(b.status === 'pending' || b.status === 'confirmed') && (
                            <form action={updateStatus.bind(null, b.id, 'cancelled')}>
                              <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Cancel Booking">
                                <XCircle className="w-5 h-5" />
                              </button>
                            </form>
                          )}

                          {/* WhatsApp Link */}
                          <a 
                            href={`https://wa.me/${b.tourist_whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${b.tourist_name}! This is Mevan from IslandFull regarding your booking for ${b.activities?.title}${b.tour_option ? ` (${b.tour_option})` : ''}.${b.pickup_location ? `\n\nPickup: ${b.pickup_location}` : ''}${b.special_requests ? `\n\nNotes: ${b.special_requests}` : ''}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-bold rounded-lg transition-colors border border-[#25D366]/20"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
