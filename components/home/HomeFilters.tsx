"use client"

import { useState, FormEvent, useEffect, useRef, useTransition } from "react"
import { Search, MapPin, Loader2, Compass, Hash } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebounce } from "@/hooks/useDebounce"
import { useOnClickOutside } from "@/hooks/useOnClickOutside"
import { searchLocationsAndTags, type SearchSuggestion } from "@/app/actions/search"
import { parseTourSort, type TourSort } from "@/lib/tour-sort"
import { markHomeListingsPin } from "@/lib/home-scroll"
import { HomeCategoryChips } from "@/components/home/HomeCategoryChips"
import { DateSearchField, GuestsSearchField } from "@/components/home/TripSearchControls"
import { SortMenu } from "@/components/home/SortMenu"
import type { HomepageCategoryMap } from "@/lib/homepage-feed"
import { listingsHref, verticalFromLocation } from "@/lib/listing-path"
import { readTripSearchFromParams, writeTripSearchToParams } from "@/lib/trip-search"
import { useHomeBrowseStore } from "@/store/useHomeBrowseStore"
import { ensureTripSearchHydrated, useTripSearchStore } from "@/store/useTripSearchStore"

export function HomeFilters({
  dynamicCategories = [],
  categoryMap,
}: {
  dynamicCategories?: any[]
  categoryMap?: HomepageCategoryMap
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const setBrowseVertical = useHomeBrowseStore((s) => s.setVertical)
  const hydrateCategories = useHomeBrowseStore((s) => s.hydrateCategories)

  const currentLocation = searchParams.get("location") || ""
  const currentSort = searchParams.get("sort") || ""

  useEffect(() => {
    if (categoryMap) hydrateCategories(categoryMap)
  }, [categoryMap, hydrateCategories])

  useEffect(() => {
    setBrowseVertical(verticalFromLocation(pathname, searchParams.get("vertical")))
  }, [pathname, searchParams, setBrowseVertical])

  useEffect(() => {
    router.prefetch("/?vertical=tour")
    router.prefetch("/transport")
    router.prefetch("/?vertical=hotel")
  }, [router])

  const [location, setLocation] = useState(currentLocation)
  const tripDate = useTripSearchStore((s) => s.date)
  const tripGuests = useTripSearchStore((s) => s.guests)
  const tripChildren = useTripSearchStore((s) => s.children)
  const tripInfants = useTripSearchStore((s) => s.infants)
  const hydrateTrip = useTripSearchStore((s) => s.hydrate)

  useEffect(() => {
    ensureTripSearchHydrated()
    const fromUrl = readTripSearchFromParams(searchParams)
    if (fromUrl.date || fromUrl.guests) hydrateTrip(fromUrl)
  }, [searchParams, hydrateTrip])

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

  const handleSearch = (e?: FormEvent) => {
    if (e) e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (location) params.set("location", location.trim())
    else params.delete("location")

    writeTripSearchToParams(params, { date: tripDate, guests: tripGuests, children: tripChildren, infants: tripInfants })
    params.delete("category")

    markHomeListingsPin()
    startTransition(() => {
      router.push(listingsHref(pathname, params), { scroll: false })
    })
  }

  const handleSortChange = (sort: TourSort) => {
    const params = new URLSearchParams(searchParams.toString())
    if (sort === "recommended") params.delete("sort")
    else params.set("sort", sort)
    startTransition(() => {
      router.push(listingsHref(pathname, params), { scroll: false })
    })
  }

  return (
    <>
      <div className="relative z-20 px-4 hidden sm:block h-0">
        <div className="max-w-5xl mx-auto -translate-y-1/2">
          <form onSubmit={handleSearch} className="flex flex-row items-center w-full bg-white border border-gray-200 rounded-full shadow-xl divide-x divide-gray-200 p-1.5 pl-6">
            <div ref={dropdownRef} className="flex-1 w-full relative flex flex-col justify-center cursor-pointer pr-4">
              <label className="text-[10px] md:text-xs font-extrabold uppercase text-gray-800 mb-0.5 tracking-wider block">Location</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="w-full outline-none text-sm text-gray-600 bg-transparent truncate"
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
                      params.delete("category");
                      startTransition(() => {
                        router.push(listingsHref(pathname, params), { scroll: false });
                      });
                    }
                  }}
                />
                {isFetching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
              </div>

              {/* Autocomplete Dropdown */}
              {isDropdownOpen && suggestions.length > 0 && (
                <ul className="absolute top-[calc(100%+16px)] left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 py-2">
                  {suggestions.map((sug, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-sm font-medium text-gray-700 transition-colors"
                      onMouseDown={(e) => {
                        setLocation(sug.text)
                        setIsDropdownOpen(false)
                        const params = new URLSearchParams(searchParams.toString())
                        params.set("location", sug.text)
                        router.push(listingsHref(pathname, params), { scroll: false })
                      }}
                    >
                      {sug.type === 'location' && <MapPin className="w-4 h-4 text-gray-400" />}
                      {sug.type === 'title' && <Compass className="w-4 h-4 text-gray-400" />}
                      {sug.type === 'category' && <Hash className="w-4 h-4 text-gray-400" />}
                      {sug.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex-1 w-full min-w-0 px-4">
              <DateSearchField />
            </div>

            <div className="flex-1 w-full min-w-0 px-4">
              <GuestsSearchField />
            </div>

            {/* Actions: Filter & Search */}
            <div className="flex items-center gap-2 pl-4">
              <SortMenu sort={currentSort} onSort={(sort) => handleSortChange(parseTourSort(sort))} />

              <button
                type="submit"
                disabled={isPending}
                className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center bg-rose-500 hover:bg-rose-600 shadow-md shadow-rose-500/20 text-white font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="hidden sm:block max-w-7xl mx-auto px-4 pt-14 mb-6 text-zinc-900">
        <div className="flex items-center min-w-0">
          <HomeCategoryChips dynamicCategories={dynamicCategories} />
        </div>
      </div>
    </>
  )
}
