"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, Calendar, Users, Map } from "lucide-react"

export function MobileSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [currentVertical, setCurrentVertical] = useState<'tour' | 'event' | 'transport'>(
    (searchParams.get("vertical") as any) || 'tour'
  )
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [date, setDate] = useState(searchParams.get("date") || "")
  const [travelers, setTravelers] = useState(searchParams.get("travelers") || "")

  const handleVerticalClick = (vertical: 'tour' | 'event' | 'transport') => {
    setCurrentVertical(vertical)
    const params = new URLSearchParams(searchParams.toString())
    params.set("vertical", vertical)
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (location) params.set("location", location)
    else params.delete("location")
    
    if (date) params.set("date", date)
    else params.delete("date")
    
    if (travelers) params.set("travelers", travelers)
    else params.delete("travelers")
    
    // Maintain sort if exists
    const sortVal = searchParams.get("sort")
    if (sortVal) params.set("sort", sortVal)
    
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="sm:hidden px-4 -mt-12 relative z-20 w-full mb-6">
      <div className="bg-white rounded-xl shadow-md p-3">
        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap w-full items-center gap-4 border-b border-zinc-100 mb-3 pb-1">
          <button 
            onClick={() => handleVerticalClick('tour')}
            className={`flex items-center gap-1.5 text-xs font-semibold pb-2 transition-colors border-b-2 -mb-[1px] ${currentVertical === 'tour' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
          >
            <Map className="w-3.5 h-3.5" /> Tours & Guides
          </button>
          <button 
            onClick={() => handleVerticalClick('event')}
            className={`flex items-center gap-1.5 text-xs font-semibold pb-2 transition-colors border-b-2 -mb-[1px] ${currentVertical === 'event' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
          >
            <Calendar className="w-3.5 h-3.5" /> Events
          </button>
          <button 
            onClick={() => handleVerticalClick('transport')}
            className={`flex items-center gap-1.5 text-xs font-semibold pb-2 transition-colors border-b-2 -mb-[1px] ${currentVertical === 'transport' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
          >
            <Users className="w-3.5 h-3.5" /> Transport
          </button>
        </div>

        {/* Inputs */}
        <form onSubmit={handleSearch} className="flex flex-col gap-2">
          {/* Location */}
          <div className="flex items-center h-10 border border-zinc-200 rounded-lg px-3 focus-within:border-rose-500 transition-colors">
            <MapPin className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Where to?" 
              className="w-full outline-none text-sm text-zinc-900 bg-transparent placeholder-zinc-400"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {/* Date */}
            <div className="flex items-center h-10 border border-zinc-200 rounded-lg px-3 focus-within:border-rose-500 transition-colors flex-1 min-w-0">
              <Calendar className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
              <input 
                type="date" 
                className="w-full outline-none text-sm text-zinc-900 bg-transparent"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Travelers */}
            <div className="flex items-center h-10 border border-zinc-200 rounded-lg px-3 focus-within:border-rose-500 transition-colors flex-1 min-w-0">
              <Users className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
              <input 
                type="text" 
                placeholder="Who?" 
                className="w-full outline-none text-sm text-zinc-900 bg-transparent placeholder-zinc-400"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
              />
            </div>
          </div>

          {/* Button */}
          <button 
            type="submit" 
            className="w-full h-10 mt-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </form>
      </div>
    </div>
  )
}
