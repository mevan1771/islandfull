"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, Calendar, Users, X, Map } from "lucide-react"

export function MobileSearchPill() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [isOpen, setIsOpen] = useState(false)
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
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Search Pill - Visible only on mobile */}
      <div className="sm:hidden px-4 -mt-6 relative z-20 w-full mb-8">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-full bg-white rounded-full p-3 px-5 shadow-md flex items-center gap-4 active:scale-[0.98] transition-transform border border-zinc-100"
        >
          <Search className="w-5 h-5 text-zinc-900" />
          <div className="flex flex-col items-start">
            <span className="text-sm font-bold text-zinc-900">Where to?</span>
            <span className="text-xs font-medium text-zinc-500">
              {location || "Anywhere"} • {date || "Any dates"} • {travelers || "Add guests"}
            </span>
          </div>
        </button>
      </div>

      {/* Full Screen Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col sm:hidden overflow-hidden animate-in slide-in-from-bottom-full duration-300">
          {/* Header */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-zinc-100 bg-white">
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 transition-colors"
            >
              <X className="w-6 h-6 text-zinc-900" />
            </button>
            <span className="text-base font-bold text-zinc-900">Search</span>
            <div className="w-10" /> {/* Balancer for X */}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
            {/* Tabs */}
            <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap w-full items-center gap-4 border-b border-zinc-100 mb-8 pb-1">
              <button 
                onClick={() => handleVerticalClick('tour')}
                className={`flex items-center gap-2 text-sm font-semibold pb-4 transition-colors border-b-2 -mb-[1px] ${currentVertical === 'tour' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
              >
                <Map className="w-4 h-4" /> Tours & Guides
              </button>
              <button 
                onClick={() => handleVerticalClick('event')}
                className={`flex items-center gap-2 text-sm font-semibold pb-4 transition-colors border-b-2 -mb-[1px] ${currentVertical === 'event' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
              >
                <Calendar className="w-4 h-4" /> Events
              </button>
              <button 
                onClick={() => handleVerticalClick('transport')}
                className={`flex items-center gap-2 text-sm font-semibold pb-4 transition-colors border-b-2 -mb-[1px] ${currentVertical === 'transport' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
              >
                <Users className="w-4 h-4" /> Transport
              </button>
            </div>

            {/* Form */}
            <form id="mobile-search-form" onSubmit={handleSearch} className="flex flex-col gap-6 flex-1">
              {/* Location */}
              <div className="w-full border border-zinc-200 rounded-3xl p-4 focus-within:border-rose-500 transition-colors shadow-sm bg-white">
                <label className="text-xs font-bold text-zinc-900 block mb-2">Where</label>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="Ella, Sigiriya..." 
                    className="w-full outline-none text-base text-zinc-900 font-medium bg-transparent"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  {location && (
                    <button 
                      type="button" 
                      onClick={() => setLocation("")}
                      className="p-1 bg-zinc-100 rounded-full text-zinc-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Date */}
              <div className="w-full border border-zinc-200 rounded-3xl p-4 focus-within:border-rose-500 transition-colors shadow-sm bg-white">
                <label className="text-xs font-bold text-zinc-900 block mb-2">When</label>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <input 
                    type="date" 
                    className="w-full outline-none text-base text-zinc-900 font-medium bg-transparent"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Travelers */}
              <div className="w-full border border-zinc-200 rounded-3xl p-4 focus-within:border-rose-500 transition-colors shadow-sm bg-white">
                <label className="text-xs font-bold text-zinc-900 block mb-2">Who</label>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-zinc-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. 2 Pax" 
                    className="w-full outline-none text-base text-zinc-900 font-medium bg-transparent"
                    value={travelers}
                    onChange={(e) => setTravelers(e.target.value)}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer Action */}
          <div className="p-4 border-t border-zinc-100 bg-white">
            <button 
              type="submit" 
              form="mobile-search-form"
              className="w-full h-[54px] bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/30"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>
      )}
    </>
  )
}
