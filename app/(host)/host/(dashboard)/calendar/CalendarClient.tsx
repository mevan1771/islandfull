"use client"

import { useState } from "react"
import { DayPicker } from "react-day-picker"
import { format, parseISO } from "date-fns"
import { toggleActivityBlock } from "@/app/actions/calendar"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
import "react-day-picker/dist/style.css"

interface Activity {
  id: string
  title: string
}

interface ActivityBlock {
  activity_id: string
  blocked_date: string
}

interface Booking {
  id: string
  activity_id: string
  travel_date: string
  tourist_name: string
  pax_count: number
  tour_option?: string
}

export default function CalendarClient({
  activities,
  activityBlocks,
  bookings
}: {
  activities: Activity[]
  activityBlocks: ActivityBlock[]
  bookings: Booking[]
}) {
  const [selectedActivityId, setSelectedActivityId] = useState<string>(activities[0]?.id || "")
  const [isLoading, setIsLoading] = useState(false)

  const [drawerDate, setDrawerDate] = useState<Date | null>(null)
  const [drawerBookings, setDrawerBookings] = useState<Booking[]>([])

  if (activities.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
        <p className="text-zinc-500">You don't have any active tours to manage.</p>
      </div>
    )
  }

  // Filter blocks and bookings for the currently selected activity
  const currentActivityBlocks = activityBlocks
    .filter(b => b.activity_id === selectedActivityId)
    .map(b => parseISO(b.blocked_date))

  const currentActivityBookings = bookings
    .filter(b => b.activity_id === selectedActivityId)

  const bookedDates = currentActivityBookings
    .map(b => parseISO(b.travel_date))

  const toggleBlock = async (dateStr: string) => {
    setIsLoading(true)
    const res = await toggleActivityBlock(selectedActivityId, dateStr)
    if (res.success) {
      toast.success("Availability updated!")
    } else {
      toast.error(res.error || "Failed to update availability")
    }
    setIsLoading(false)
  }

  const handleDayClick = async (day: Date) => {
    if (!selectedActivityId || isLoading) return
    
    // Normalize date to YYYY-MM-DD local time
    const dateStr = format(day, "yyyy-MM-dd")
    
    // Check if there are bookings for this day
    const dayBookings = currentActivityBookings.filter(b => b.travel_date === dateStr)
    
    if (dayBookings.length > 0) {
      setDrawerDate(day)
      setDrawerBookings(dayBookings)
      return
    }

    await toggleBlock(dateStr)
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 flex flex-col md:flex-row gap-8">
      {/* Activity Selector */}
      <div className="flex-1 space-y-4">
        <div>
          <label className="block text-sm font-bold text-zinc-700 mb-2">Select Activity</label>
          <select 
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-black transition-all"
            value={selectedActivityId}
            onChange={(e) => setSelectedActivityId(e.target.value)}
          >
            {activities.map(act => (
              <option key={act.id} value={act.id}>{act.title}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3 pt-4 border-t border-zinc-100">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Legend</h3>
          <div className="flex items-center gap-3 text-sm font-medium">
            <div className="w-4 h-4 rounded-full bg-red-100 border border-red-200 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            </div>
            <span>Blocked (Unavailable)</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium">
            <div className="w-4 h-4 rounded-full border border-blue-200 flex items-center justify-center relative">
              <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
            </div>
            <span>Has Confirmed Bookings</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="relative flex justify-center border-l-0 md:border-l border-zinc-100 md:pl-8">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
          </div>
        )}
        
        <style>{`
          .rdp-day_selected {
            background-color: transparent !important;
            color: inherit !important;
          }
          .blocked-day {
            background-color: #fee2e2 !important;
            color: #b91c1c !important;
            text-decoration: line-through;
            font-weight: bold;
            border-radius: 8px !important;
          }
          .booked-day::after {
            content: '';
            display: block;
            width: 4px;
            height: 4px;
            background-color: #3b82f6;
            border-radius: 50%;
            position: absolute;
            bottom: 2px;
            left: 50%;
            transform: translateX(-50%);
          }
          .rdp-day {
            position: relative;
            border-radius: 8px !important;
            transition: all 0.2s;
          }
          .rdp-day:hover:not(.blocked-day) {
            background-color: #f4f4f5 !important;
          }
          .rdp-day:hover.blocked-day {
            background-color: #fecaca !important;
          }
        `}</style>
        
        <DayPicker
          mode="multiple"
          onDayClick={handleDayClick}
          modifiers={{
            blocked: currentActivityBlocks,
            booked: bookedDates,
          }}
          modifiersClassNames={{
            blocked: 'blocked-day',
            booked: 'booked-day',
          }}
          className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm"
        />
      </div>

      {/* Mobile Drawer (Guest Details) */}
      {drawerDate && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setDrawerDate(null)}
          ></div>
          
          {/* Drawer Content */}
          <div className="bg-white rounded-t-3xl p-6 relative z-10 animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-y-auto w-full md:max-w-md md:mx-auto">
            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mx-auto mb-6"></div>
            
            <h3 className="text-2xl font-bold text-zinc-900 mb-1">
              {format(drawerDate, 'MMMM d, yyyy')}
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              {drawerBookings.length} {drawerBookings.length === 1 ? 'booking' : 'bookings'} expected
            </p>

            <div className="space-y-4 mb-8">
              {drawerBookings.map((b, i) => (
                <div key={b.id || i} className="bg-zinc-50 border border-zinc-100 rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-zinc-900">{b.tourist_name}</span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">{b.pax_count} Pax</span>
                  </div>
                  {b.tour_option && (
                    <div className="text-sm text-zinc-500 font-medium">Time: {b.tour_option}</div>
                  )}
                </div>
              ))}
            </div>

            <button 
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
              onClick={async () => {
                await toggleBlock(format(drawerDate, "yyyy-MM-dd"))
                setDrawerDate(null)
              }}
              disabled={isLoading}
            >
              Block Date (Prevent New Bookings)
            </button>
            
            <button 
              className="w-full mt-3 bg-white border-2 border-zinc-200 text-zinc-800 hover:bg-zinc-50 font-bold py-4 rounded-xl transition-colors"
              onClick={() => setDrawerDate(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
