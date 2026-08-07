"use client"

import Image from "next/image"
import { format, parseISO } from "date-fns"
import { Calendar, Users, Clock } from "lucide-react"

interface Booking {
  id: string
  tourist_name: string
  pax_count: number
  travel_date: string
  status: string
  tour_option?: string
  activities?: {
    title: string
    card_image_url: string
    cover_image_url: string
  }
}

export default function BookingsListClient({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-zinc-100 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-zinc-400" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 mb-2">No upcoming bookings</h3>
        <p className="text-zinc-500 max-w-sm">You have no upcoming bookings at the moment. When customers book your activities, they will appear here.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed':
      case 'paid':
      case 'redeemed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'pending':
      case 'pending_payment':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      default:
        return 'bg-zinc-100 text-zinc-700 border-zinc-200'
    }
  }

  return (
    <div className="space-y-4">
      {bookings.map(booking => {
        const imageUrl = booking.activities?.card_image_url || booking.activities?.cover_image_url || 'https://images.pexels.com/photos/1243337/pexels-photo-1243337.jpeg?auto=compress&cs=tinysrgb&w=800'
        
        return (
          <div key={booking.id} className="bg-white rounded-2xl p-3 shadow-sm border border-zinc-100 flex items-center gap-4 transition-all hover:shadow-md">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-zinc-100">
              <Image 
                src={imageUrl}
                alt={booking.activities?.title || 'Activity'}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 truncate">
                  <h3 className="font-extrabold text-zinc-900 text-sm sm:text-base truncate">
                    {format(parseISO(booking.travel_date), 'MMM d, yyyy')}
                  </h3>
                  {booking.tour_option && (
                    <span className="text-[10px] font-semibold text-zinc-500 inline-flex items-center gap-1 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {booking.tour_option}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border whitespace-nowrap shrink-0 ${getStatusColor(booking.status)}`}>
                  {booking.status.replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-xs sm:text-sm font-medium text-zinc-500 truncate mb-1">
                {booking.activities?.title}
              </p>
              
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-zinc-900 truncate">
                <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate text-zinc-700">{booking.tourist_name}</span>
                <span className="text-zinc-300 mx-0.5">•</span>
                <span className="text-rose-600 shrink-0">{booking.pax_count} Guest{booking.pax_count !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
