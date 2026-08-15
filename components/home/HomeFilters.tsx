"use client"

import { useState, FormEvent, useEffect, useRef, useTransition } from "react"
import { Search, MapPin, Calendar, Users, Map, ArrowDownUp, Heart, Loader2, SlidersHorizontal, Bike, ArrowRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/useDebounce"
import { useOnClickOutside } from "@/hooks/useOnClickOutside"
import { searchLocationsAndTags } from "@/app/actions/search"
import { TransportHub } from "@/components/transport/TransportHub"

type CategoryType = {
  id: string
  name: string
  icon?: any
}

const CATEGORIES: CategoryType[] = [
  { id: "all", name: "All" },
  { id: "saved", name: "", icon: Heart },
  { id: "surf", name: "Surfing" },
  { id: "wildlife-safaris", name: "Wildlife Safaris" },
  { id: "hiking-treks", name: "Hiking & Treks" },
  { id: "culture-history", name: "Culture & History" },
]

export function HomeFilters({ dynamicCategories = [] }: { dynamicCategories?: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentVertical = searchParams.get("vertical") || "tour"
  const currentCategory = searchParams.get("category") || "all"
  const currentLocation = searchParams.get("location") || ""
  const currentSort = searchParams.get("sort") || ""

  const [optimisticCategory, setOptimisticCategory] = useState(currentCategory)
  const [optimisticVertical, setOptimisticVertical] = useState(currentVertical)

  useEffect(() => {
    setOptimisticCategory(currentCategory)
  }, [currentCategory])

  useEffect(() => {
    setOptimisticVertical(currentVertical)
  }, [currentVertical])

  useEffect(() => {
    const grid = document.getElementById('activity-grid-container')
    if (grid) {
      grid.style.opacity = isPending ? '0.5' : '1'
      grid.style.pointerEvents = isPending ? 'none' : 'auto'
      grid.style.transition = 'opacity 0.2s'
    }
  }, [isPending])

  const [location, setLocation] = useState(currentLocation)
  const [date, setDate] = useState("")
  const [travelers, setTravelers] = useState("")

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

  const CATEGORIES = [
    { id: "all", name: "All" },
    { id: "saved", name: "", icon: Heart },
    ...dynamicCategories.map(c => ({ id: c.slug, name: c.name }))
  ]

  const handleSearch = (e?: FormEvent) => {
    if (e) e.preventDefault()
    
    const params = new URLSearchParams(searchParams.toString())
    
    if (location) params.set("location", location)
    else params.delete("location")
    
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
  }

  const handleCategoryClick = (categoryId: string) => {
    setOptimisticCategory(categoryId) // Optimistic UI update
    const params = new URLSearchParams(searchParams.toString())
    
    if (categoryId !== "all") params.set("category", categoryId)
    else params.delete("category")
    
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
  }

  const handleVerticalClick = (vertical: string) => {
    setOptimisticVertical(vertical)
    const params = new URLSearchParams(searchParams.toString())
    params.set("vertical", vertical)
    params.delete("category") // Reset category when switching vertical
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    if (e.target.value) {
      params.set("sort", e.target.value)
    } else {
      params.delete("sort")
    }
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <>
      {/* Floating Search Widget (Desktop only now) */}
      <div className="relative -mt-24 z-20 px-4 hidden sm:block">
        <div className="max-w-5xl mx-auto bg-white rounded-xl md:rounded-3xl p-3 sm:p-6 md:p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex overflow-x-auto no-scrollbar whitespace-nowrap w-full items-center gap-4 sm:gap-6 border-b border-zinc-100 mb-6">
            <button 
              onClick={() => handleVerticalClick('tour')}
              className={`flex items-center gap-2 text-xs sm:text-sm font-semibold pb-4 whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${optimisticVertical === 'tour' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
            >
              <Map className="w-4 h-4" /> Tours
            </button>
            <button 
              onClick={() => handleVerticalClick('event')}
              className={`flex items-center gap-2 text-xs sm:text-sm font-semibold pb-4 whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${optimisticVertical === 'event' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
            >
              <Calendar className="w-4 h-4" /> Events
            </button>
            <button 
              onClick={() => handleVerticalClick('transport')}
              className={`flex items-center gap-2 text-xs sm:text-sm font-semibold pb-4 whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${optimisticVertical === 'transport' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
            >
              <Bike className="w-4 h-4" /> Transport
            </button>
          </div>

          {/* Inputs */}
          {optimisticVertical === 'transport' ? (
            <div className="w-full -mt-2">
              <TransportHub />
            </div>
          ) : (
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-3 w-full">
              <div ref={dropdownRef} className="flex-1 w-full h-[60px] bg-gray-50 border border-gray-200 rounded-2xl p-2 px-4 focus-within:bg-white focus-within:border-gray-300 focus-within:shadow-sm transition-all duration-300 relative flex flex-col justify-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Location</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    placeholder="Where are you going?" 
                    className="w-full outline-none text-xs sm:text-sm text-gray-900 font-medium bg-transparent placeholder:text-gray-400"
                    value={location}
                    onFocus={() => {
                      setIsFocused(true)
                      if (suggestions.length > 0) setIsDropdownOpen(true)
                    }}
                    onBlur={() => setIsFocused(false)}
                    onChange={(e) => {
                      const val = e.target.value;
                      setLocation(val);
                      if (val === "") {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("location");
                        router.push(`/?${params.toString()}`, { scroll: false });
                      }
                    }}
                  />
                  {isFetching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
                </div>

                {/* Autocomplete Dropdown */}
                {isDropdownOpen && suggestions.length > 0 && (
                  <ul className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-2">
                    {suggestions.map((sug, idx) => (
                      <li 
                        key={idx}
                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm font-medium text-gray-700 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault() // prevent input blur
                          setLocation(sug)
                          setIsDropdownOpen(false)
                          const params = new URLSearchParams(searchParams.toString())
                          params.set("location", sug)
                          router.push(`/?${params.toString()}`, { scroll: false })
                        }}
                      >
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {sug}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="flex-1 w-full h-[60px] bg-gray-50 border border-gray-200 rounded-2xl p-2 px-4 focus-within:bg-white focus-within:border-gray-300 focus-within:shadow-sm transition-all duration-300 flex flex-col justify-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Date</label>
                <input 
                  type="date" 
                  className={`w-full outline-none text-xs sm:text-sm font-medium bg-transparent cursor-pointer ${date ? 'text-gray-900' : 'text-gray-400'}`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="flex-1 w-full h-[60px] bg-gray-50 border border-gray-200 rounded-2xl p-2 px-4 focus-within:bg-white focus-within:border-gray-300 focus-within:shadow-sm transition-all duration-300 flex flex-col justify-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-0.5">Travelers</label>
                <input 
                  type="text" 
                  placeholder="Add guests" 
                  className="w-full outline-none text-xs sm:text-sm text-gray-900 font-medium bg-transparent placeholder:text-gray-400"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                />
              </div>

              {/* Actions: Filter & Search */}
              <div className="flex items-center gap-2 w-full md:w-auto h-[60px]">
                {/* Filter / Sort Button */}
                <div className="relative h-full aspect-square flex-shrink-0 flex items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-sm text-gray-600 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-300">
                  <SlidersHorizontal className="w-5 h-5" />
                  <select 
                    value={currentSort}
                    onChange={handleSortChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="">Sort by...</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating_desc">Rating: Highest First</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  disabled={isPending}
                  className="flex-1 md:flex-none h-full md:aspect-square flex items-center justify-center rounded-2xl bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 text-white font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 md:mr-0 mr-2" />
                      <span className="md:hidden block">Search</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Activity Grid Header / Filters */}
      <div className="max-w-7xl mx-auto px-4 mt-4 md:mt-16 mb-2 md:mb-6 text-zinc-900 overflow-hidden md:overflow-visible">
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex w-[calc(100%+2rem)] md:w-auto -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto flex-nowrap whitespace-nowrap gap-2 pb-2 items-center md:gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {CATEGORIES.map((cat) => {
              const Icon = (cat as any).icon || null;
              return (
                <button 
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center justify-center shrink-0 rounded-full transition-all duration-300 ease-out active:scale-95 border ${
                    cat.id === "saved" ? "w-10 md:w-11 h-10 md:h-11 p-0" : "gap-2 px-4 py-2 md:px-4 md:py-2 text-sm md:text-base font-medium"
                  } ${
                    optimisticCategory === cat.id 
                      ? "bg-black text-white border-black shadow-md" 
                      : "bg-white text-zinc-600 border-gray-300 hover:border-gray-900 hover:bg-zinc-100"
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${
                    cat.id === 'saved' 
                      ? (optimisticCategory === cat.id ? "fill-rose-500 text-rose-500" : "text-zinc-600")
                      : (optimisticCategory === cat.id ? "fill-white" : "")
                  }`} />}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  )
}
