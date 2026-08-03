"use client"

import { useState } from "react"
import { CheckCircle2, XCircle, MessageCircle, Clock, CalendarDays, Users, Download, Trash2 } from "lucide-react"
import { updateStatus, archiveBooking } from "@/app/actions/bookings"

export default function BookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [filter, setFilter] = useState<'default' | 'all' | 'active' | 'pending' | 'cancelled'>('all')
  
  const handleArchive = async (id: string) => {
    if (window.confirm("Are you sure you want to archive this booking? It will be hidden from the dashboard but kept for financial records.")) {
      // Optimistic UI update
      setBookings(prev => prev.filter(b => b.id !== id))
      await archiveBooking(id)
    }
  }

  const exportToCSV = () => {
    const headers = ['Booking ID', 'Status', 'Guest Name', 'Email', 'Activity', 'Date', 'Pax', 'Price'];
    const csvRows = [headers.join(',')];

    bookings.forEach(b => {
      const row = [
        b.id,
        b.status,
        `"${b.tourist_name || ''}"`,
        `"${b.tourist_email || ''}"`,
        `"${b.activities?.title || ''}"`,
        new Date(b.travel_date).toLocaleDateString(),
        b.pax_count,
        b.total_usd
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  const filteredBookings = bookings.filter(b => {
    if (filter === 'default') return b.status === 'confirmed' || b.status.toLowerCase().includes('pending') || b.status === 'completed';
    if (filter === 'active') return b.status === 'confirmed' || b.status === 'completed';
    if (filter === 'pending') return b.status.toLowerCase().includes('pending');
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true; // all
  });

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
          <p className="text-zinc-500 mt-1">Manage all live bookings and communicate with guests.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg font-semibold shadow-sm hover:bg-zinc-800 transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Export Data
          </button>
          <div className="px-4 py-2 bg-rose-50 rounded-lg text-rose-600 font-semibold border border-rose-100 shadow-sm text-sm flex items-center">
            Total Bookings: {bookings.length}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === 'all' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter('default')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === 'default' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'}`}
        >
          Active & Pending
        </button>
        <button 
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === 'active' ? 'bg-blue-600 text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'}`}
        >
          Active
        </button>
        <button 
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === 'pending' ? 'bg-amber-500 text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${filter === 'cancelled' ? 'bg-red-500 text-white' : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'}`}
        >
          Cancelled
        </button>
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
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No bookings found in this view.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b: any) => (
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
                      <div className="flex items-center gap-2 text-zinc-500 mt-1.5">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        <span className="font-medium text-xs">Booked: {new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Status Actions */}
                        {b.status === 'pending' && (
                          <form action={() => {
                            updateStatus(b.id, 'confirmed')
                            setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, status: 'confirmed' } : bk))
                          }}>
                            <button type="submit" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200" title="Confirm Booking">
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                          </form>
                        )}
                        {(b.status === 'pending' || b.status === 'confirmed') && (
                          <form action={() => {
                            updateStatus(b.id, 'cancelled')
                            setBookings(prev => prev.map(bk => bk.id === b.id ? { ...bk, status: 'cancelled' } : bk))
                          }}>
                            <button type="submit" className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Cancel Booking">
                              <XCircle className="w-5 h-5" />
                            </button>
                          </form>
                        )}

                        {/* WhatsApp Link */}
                        <a 
                          href={`https://wa.me/${(b.tourist_whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${b.tourist_name}! This is Mevan from IslandFull regarding your booking for ${b.activities?.title}${b.tour_option ? ` (${b.tour_option})` : ''}.${b.pickup_location ? `\n\nPickup: ${b.pickup_location}` : ''}${b.special_requests ? `\n\nNotes: ${b.special_requests}` : ''}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 font-bold rounded-lg transition-colors border border-[#25D366]/20"
                        >
                          <MessageCircle className="w-4 h-4" />
                          Chat
                        </a>
                        
                        {/* Archive Action */}
                        <button 
                          onClick={() => handleArchive(b.id)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 text-zinc-500 hover:bg-rose-50 hover:text-rose-500 font-bold rounded-lg transition-colors border border-zinc-200 hover:border-rose-200 ml-1"
                          title="Archive Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
