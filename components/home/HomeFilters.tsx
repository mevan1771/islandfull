"use client"

import { useState, FormEvent } from "react"
import { Search, MapPin, Calendar, Users, Map, ArrowDownUp } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

const CATEGORIES = [
  { id: "all", name: "All Places" },
  { id: "surf", name: "Surfing" },
  { id: "wildlife-safaris", name: "Wildlife Safaris" },
  { id: "hiking-treks", name: "Hiking & Treks" },
  { id: "culture-history", name: "Culture & History" },
]

export function HomeFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get("category") || "all"
  const currentLocation = searchParams.get("location") || ""
  const currentSort = searchParams.get("sort") || ""

  const [location, setLocation] = useState(currentLocation)
  const [date, setDate] = useState("")
  const [travelers, setTravelers] = useState("")

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

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    const sortVal = e.target.value
    
    if (sortVal) params.set("sort", sortVal)
    else params.delete("sort")
    
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      {/* Floating Search Widget */}
      <div className="relative -mt-24 z-20 px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-zinc-100 pb-4 mb-6 overflow-x-auto hide-scrollbar">
            <button className="flex items-center gap-2 text-rose-500 font-semibold border-b-2 border-rose-500 pb-4 -mb-[18px] whitespace-nowrap">
              <Map className="w-4 h-4" /> Tours & Guides
            </button>
            <button className="flex items-center gap-2 text-zinc-500 font-medium pb-4 hover:text-zinc-900 transition-colors whitespace-nowrap">
              Flight
            </button>
            <button className="flex items-center gap-2 text-zinc-500 font-medium pb-4 hover:text-zinc-900 transition-colors whitespace-nowrap">
              Hotel
            </button>
          </div>

          {/* Inputs */}
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 w-full border border-zinc-200 rounded-2xl p-3 px-4 focus-within:border-rose-500 transition-colors">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Location</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="Ella, Sigiriya..." 
                  className="w-full outline-none text-zinc-900 font-medium bg-transparent"
                  value={location}
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
              </div>
            </div>
            
            <div className="flex-1 w-full border border-zinc-200 rounded-2xl p-3 px-4">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Date (Optional)</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-zinc-400" />
                <input 
                  type="date" 
                  className="w-full outline-none text-zinc-900 font-medium bg-transparent"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 w-full border border-zinc-200 rounded-2xl p-3 px-4">
              <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Travelers (Optional)</label>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="e.g. 2 Pax" 
                  className="w-full outline-none text-zinc-900 font-medium bg-transparent"
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="w-full md:w-auto h-[60px] bg-rose-500 hover:bg-rose-600 text-white px-10 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/30">
              <Search className="w-5 h-5" />
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Activity Grid Header / Filters */}
      <div className="max-w-7xl mx-auto px-4 mt-16 mb-8 text-zinc-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors border ${
                  currentCategory === cat.id
                    ? 'border-rose-500 text-rose-500 bg-rose-50' 
                    : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 border border-zinc-200 rounded-full bg-white text-sm font-medium text-zinc-700">
              <ArrowDownUp className="w-4 h-4 text-zinc-400" />
              <select 
                value={currentSort}
                onChange={handleSortChange}
                className="bg-transparent outline-none cursor-pointer"
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
