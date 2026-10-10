"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, MapPin, Calendar, Users, Map, Loader2, SlidersHorizontal, Bike, Compass, Hash } from "lucide-react"
import locationPin from "@/components/ui/Location icon/354556546.jpg"
import { useDebounce } from "@/hooks/useDebounce"
import { useOnClickOutside } from "@/hooks/useOnClickOutside"
import { searchLocationsAndTags, type SearchSuggestion } from "@/app/actions/search"
import { parseTourSort } from "@/lib/tour-sort"


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

  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
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
      
      if (results.length === 1 && results[0].text === debouncedLocation) {
        setIsDropdownOpen(false)
      } else {
        setIsDropdownOpen(true)
      }
      
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

    if (location) params.set("location", location.trim())
    else params.delete("location")

    params.delete("category")

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

  const dateLabel = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
    : "Date"

  return (
    <div className="sm:hidden px-4 -mt-5 relative z-20 w-full mb-3">
      <div className="bg-white rounded-xl shadow-md p-2.5">
        {/* Tabs */}
        <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap w-full items-center gap-4 border-b border-zinc-100 mb-2 pb-1">
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
        <form onSubmit={handleSearch} className="flex flex-col gap-2">
          <div className="flex items-stretch h-11 rounded-full border border-zinc-200 bg-zinc-50 focus-within:border-rose-400 overflow-visible">
            <div ref={dropdownRef} className="relative flex min-w-0 flex-1 items-center pl-3.5 pr-2">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 mr-1.5 shrink-0" />
              <input
                type="text"
                placeholder="Where to?"
                className="w-full min-w-0 outline-none text-sm text-zinc-900 bg-transparent placeholder-zinc-400 truncate"
                value={location}
                onFocus={() => {
                  setIsFocused(true)
                  if (suggestions.length > 0) setIsDropdownOpen(true)
                }}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => {
                  const val = e.target.value
                  setLocation(val)
                  if (val === "") {
                    const params = new URLSearchParams(searchParams.toString())
                    params.delete("location")
                    params.delete("category")
                    startTransition(() => {
                      router.push(`/?${params.toString()}`, { scroll: false })
                    })
                  }
                }}
              />
              {isFetching && <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin shrink-0" />}

              {isDropdownOpen && suggestions.length > 0 && (
                <ul className="absolute top-[calc(100%+10px)] left-0 right-0 w-[min(18rem,calc(100vw-2.5rem))] bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {suggestions.map((sug, index) => (
                    <li
                      key={index}
                      className="px-4 py-3 hover:bg-zinc-50 cursor-pointer flex items-center gap-2 text-sm font-medium text-zinc-700 transition-colors border-b border-zinc-50 last:border-0"
                      onMouseDown={() => {
                        setLocation(sug.text)
                        setIsDropdownOpen(false)
                        const params = new URLSearchParams(searchParams.toString())
                        params.set("location", sug.text)
                        router.push(`/?${params.toString()}`, { scroll: false })
                      }}
                    >
                      {sug.type === "location" && <MapPin className="w-4 h-4 text-zinc-400" />}
                      {sug.type === "title" && <Compass className="w-4 h-4 text-zinc-400" />}
                      {sug.type === "category" && <Hash className="w-4 h-4 text-zinc-400" />}
                      <span className="truncate">{sug.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <span className="w-px bg-zinc-200 my-2.5 shrink-0" />

            <label className="relative flex items-center gap-1 px-2.5 shrink-0 min-w-[4.5rem] cursor-pointer">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className={`text-xs whitespace-nowrap ${date ? "text-zinc-900 font-medium" : "text-zinc-400"}`}>
                {dateLabel}
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                aria-label="Travel date"
              />
            </label>

            <span className="w-px bg-zinc-200 my-2.5 shrink-0" />

            <div className="flex items-center gap-1 px-2.5 pr-3.5 w-[4.35rem] shrink-0">
              <Users className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="Who"
                aria-label="Travelers"
                className="w-full min-w-0 outline-none text-xs text-zinc-900 bg-transparent placeholder-zinc-400"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
              />
            </div>
          </div>

          {/* Actions: Filter & Map & Search */}
          <div className="w-full flex items-center gap-2">
            {/* Map Button */}
            <button
              type="button"
              onClick={() => router.push('/map')}
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-300 shadow-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              aria-label="Explore map"
            >
              <span className="text-[1.1rem]">🌍</span>
            </button>

            <Link
              href="/destinations"
              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-300 shadow-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
              aria-label="Destinations"
            >
              <Image
                src={locationPin}
                alt=""
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
              />
            </Link>

            {/* Filter / Sort Button */}
            <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-300 shadow-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 cursor-pointer transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              <select
                value={parseTourSort(searchParams.get("sort"))}
                onChange={(e) => {
                  const params = new URLSearchParams(searchParams.toString())
                  const sort = e.target.value
                  if (!sort || sort === "recommended") params.delete("sort")
                  else params.set("sort", sort)
                  router.push(`/?${params.toString()}`, { scroll: false })
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
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
      </div>
    </div>
  )
}
