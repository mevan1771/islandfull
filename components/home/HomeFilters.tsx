"use client"

import { useState, FormEvent, useEffect, useRef } from "react"
import { Search, MapPin, Calendar, Users, Map, ArrowDownUp, Heart, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/useDebounce"
import { useOnClickOutside } from "@/hooks/useOnClickOutside"
import { searchLocationsAndTags } from "@/app/actions/search"

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

  const currentVertical = searchParams.get("vertical") || "tour"
  const currentCategory = searchParams.get("category") || "all"
  const currentLocation = searchParams.get("location") || ""
  const currentSort = searchParams.get("sort") || ""

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
    
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (categoryId !== "all") params.set("category", categoryId)
    else params.delete("category")
    
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const handleVerticalClick = (vertical: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("vertical", vertical)
    params.delete("category") // Reset category when switching vertical
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    const sortVal = e.target.value
    
    if (sortVal) params.set("sort", sortVal)
    else params.delete("sort")
    
    router.push(`/?${params.toString()}`, { scroll: false })
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
              className={`flex items-center gap-2 text-xs sm:text-sm font-semibold pb-4 whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${currentVertical === 'tour' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
            >
              <Map className="w-4 h-4" /> Tours
            </button>
            <button 
              onClick={() => handleVerticalClick('event')}
              className={`flex items-center gap-2 text-xs sm:text-sm font-semibold pb-4 whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${currentVertical === 'event' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
            >
              <Calendar className="w-4 h-4" /> Events
            </button>
            <button 
              onClick={() => handleVerticalClick('transport')}
              className={`flex items-center gap-2 text-xs sm:text-sm font-semibold pb-4 whitespace-nowrap transition-colors border-b-2 -mb-[1px] ${currentVertical === 'transport' ? 'text-rose-500 border-rose-500' : 'text-zinc-500 border-transparent hover:text-zinc-900'}`}
            >
              <Users className="w-4 h-4" /> Transport
            </button>
          </div>

          {/* Inputs */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4">
            <div ref={dropdownRef} className="flex-1 w-full border border-zinc-200 rounded-xl p-2 px-3 md:p-3 md:px-4 focus-within:border-rose-500 transition-colors relative">
              <label className="text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Location</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Ella, Sigiriya..." 
                  className="w-full outline-none text-sm md:text-base text-zinc-900 font-medium bg-transparent"
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
                {isFetching && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />}
              </div>

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50">
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
            
            <div className="flex-1 w-full border border-zinc-200 rounded-xl p-2 px-3 md:p-3 md:px-4">
              <label className="text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Date (Optional)</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                <input 
                  type="date" 
                  className="w-full outline-none text-sm md:text-base text-zinc-900 font-medium bg-transparent"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 w-full border border-zinc-200 rounded-xl p-2 px-3 md:p-3 md:px-4">
              <label className="text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Travelers (Optional)</label>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 md:w-5 md:h-5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="e.g. 2 Pax" 
                  className="w-full outline-none text-sm md:text-base text-zinc-900 font-medium bg-transparent"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="w-full md:w-auto h-[50px] md:h-[60px] bg-rose-500 hover:bg-rose-600 text-white px-10 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/30">
              <Search className="w-5 h-5" />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Activity Grid Header / Filters */}
      <div className="max-w-7xl mx-auto px-4 mt-8 md:mt-16 mb-4 md:mb-6 text-zinc-900">
        <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex w-full md:w-auto overflow-x-auto flex-nowrap whitespace-nowrap gap-2 pb-2 px-4 -mx-4 md:px-0 md:mx-0 items-center md:gap-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {CATEGORIES.map((cat) => {
              const Icon = (cat as any).icon || null;
              return (
                <button 
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex items-center justify-center rounded-full transition-all duration-200 border ${
                    cat.id === "saved" ? "w-[36px] md:w-[42px] h-[36px] md:h-[42px]" : "gap-2 px-4 py-2 md:px-5 md:py-2.5 text-sm font-medium"
                  } ${
                    currentCategory === cat.id 
                      ? "bg-black text-white border-black shadow-md" 
                      : "bg-white text-zinc-600 border-gray-300 hover:border-gray-900"
                  }`}
                >
                  {Icon && <Icon className={`w-4 h-4 ${
                    cat.id === 'saved' 
                      ? (currentCategory === cat.id ? "fill-rose-500 text-rose-500" : "text-zinc-600")
                      : (currentCategory === cat.id ? "fill-white" : "")
                  }`} />}
                  {cat.name}
                </button>
              );
            })}
          </div>
          <div className="flex items-center justify-end w-full md:w-auto self-end flex-shrink-0">
            <div className="flex items-center gap-1.5 md:px-4 md:py-2 md:rounded-full md:bg-zinc-50 md:hover:bg-zinc-100 text-xs md:text-sm font-semibold text-gray-500 md:text-zinc-600 transition-colors cursor-pointer">
              <span>Sort by:</span>
              <select 
                value={currentSort}
                onChange={handleSortChange}
                className="bg-transparent outline-none cursor-pointer appearance-none pr-4 text-gray-900 md:text-zinc-600 font-bold md:font-semibold"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right center',
                  backgroundSize: '12px'
                }}
              >
                <option value="">Recommended</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
