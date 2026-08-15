"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, Calendar, Users, Map, Loader2, SlidersHorizontal, Bike } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { useOnClickOutside } from "@/hooks/useOnClickOutside"
import { searchLocationsAndTags } from "@/app/actions/search"
import { TransportHub } from "@/components/transport/TransportHub"

export function MobileSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [currentVertical, setCurrentVertical] = useState<'tour' | 'event' | 'transport'>(
    (searchParams.get("vertical") as any) || 'tour'
  )
  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [date, setDate] = useState(searchParams.get("date") || "")
  const [travelers, setTravelers] = useState(searchParams.get("travelers") || "")

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const debouncedLocation = useDebounce(location, 300)

  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false))

  useEffect(() => {
    async function fetchSuggestions() {
      if (!debouncedLocation || debouncedLocation.length < 2) {
        setSuggestions([])
        setIsFetching(false)
        return
      }
      setIsFetching(true)
      const results = await searchLocationsAndTags(debouncedLocation)
      setSuggestions(results)
      setIsDropdownOpen(true)
      setIsFetching(false)
    }

    if (isFocused) {
      fetchSuggestions()
    }
  }, [debouncedLocation, isFocused])

  const handleVerticalClick = (vertical: 'tour' | 'event' | 'transport') => {
    setCurrentVertical(vertical)
    const params = new URLSearchParams(searchParams.toString())
    params.set("vertical", vertical)
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
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
    
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
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
            <Map className="w-3.5 h-3.5" /> Tours
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
            <Bike className="w-3.5 h-3.5" /> Transport
          </button>
        </div>

        {/* Inputs */}
        {currentVertical === 'transport' ? (
          <div className="w-full mt-2">
            <TransportHub />
          </div>
        ) : (
          <form onSubmit={handleSearch} className="flex flex-col gap-2">
            {/* Location */}
            <div ref={dropdownRef} className="relative">
              <div className="flex items-center h-10 border border-zinc-200 rounded-lg px-3 focus-within:border-rose-500 transition-colors">
                <MapPin className="w-4 h-4 text-zinc-400 mr-2 flex-shrink-0" />
                <input 
                  type="text" 
                  placeholder="Where to?" 
                  className="w-full outline-none text-sm text-zinc-900 bg-transparent placeholder-zinc-400"
                  value={location}
                  onFocus={() => {
                    setIsFocused(true)
                    if (suggestions.length > 0) setIsDropdownOpen(true)
                  }}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {isFetching && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />}
              </div>

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((sug, idx) => (
                    <li 
                      key={idx}
                      className="px-4 py-3 hover:bg-zinc-50 cursor-pointer flex items-center gap-2 text-sm font-medium text-zinc-700 transition-colors border-b border-zinc-50 last:border-0"
                      onMouseDown={(e) => {
                        e.preventDefault() // prevent input blur
                        setLocation(sug)
                        setIsDropdownOpen(false)
                        const params = new URLSearchParams(searchParams.toString())
                        params.set("location", sug)
                        router.push(`/?${params.toString()}`, { scroll: false })
                      }}
                    >
                      <Search className="w-4 h-4 text-zinc-400" />
                      {sug}
                    </li>
                  ))}
                </ul>
              )}
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

            {/* Actions: Filter & Map & Search */}
            <div className="w-full flex items-center gap-2 mt-1">
              {/* Map Button */}
              <button 
                type="button"
                onClick={() => router.push('/map')}
                className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-300 shadow-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                <span className="text-[1.1rem]">🌍</span>
              </button>

              {/* Filter / Sort Button */}
              <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-300 shadow-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 cursor-pointer transition-colors">
                <SlidersHorizontal className="w-4 h-4" />
                <select 
                  value={searchParams.get("sort") || ""}
                  onChange={(e) => {
                    const params = new URLSearchParams(searchParams.toString())
                    if (e.target.value) params.set("sort", e.target.value)
                    else params.delete("sort")
                    router.push(`/?${params.toString()}`, { scroll: false })
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  <option value="">Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              {/* Search Button */}
              <button 
                type="submit" 
                className="flex-1 h-10 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
