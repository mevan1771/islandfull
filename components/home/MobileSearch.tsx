"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, Loader2, SlidersHorizontal, Compass, Hash } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { searchLocationsAndTags, type SearchSuggestion } from "@/app/actions/search"
import { parseTourSort } from "@/lib/tour-sort"
import { HomeCategoryChips } from "@/components/home/HomeCategoryChips"
import { UserNavMenu } from "@/components/layout/UserNavMenu"
import type { HomepageCategory, HomepageCategoryMap } from "@/lib/homepage-feed"
import { useHomeBrowseStore } from "@/store/useHomeBrowseStore"
import { markHomeListingsPin, peekHomeListingsPin } from "@/lib/home-scroll"
import { useMobileChromeStore } from "@/store/useMobileChromeStore"
import { listingsHref } from "@/lib/listing-path"
import { readTripSearchFromParams, writeTripSearchToParams } from "@/lib/trip-search"
import { DateSearchField, GuestsSearchField } from "@/components/home/TripSearchControls"
import { ensureTripSearchHydrated, useTripSearchStore } from "@/store/useTripSearchStore"

function WhereField({
  location,
  isFetching,
  showMenu,
  suggestions,
  isDropdownOpen,
  onLocation,
  onFocus,
  onBlur,
  onPick,
}: {
  location: string
  isFetching: boolean
  showMenu: boolean
  suggestions: SearchSuggestion[]
  isDropdownOpen: boolean
  onLocation: (value: string) => void
  onFocus: () => void
  onBlur: () => void
  onPick: (text: string) => void
}) {
  return (
    <div className="relative flex min-w-0 flex-1 items-center">
      <input
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        placeholder="Where to?"
        className="w-full min-w-0 bg-transparent text-sm font-medium text-zinc-900 outline-none placeholder-zinc-400"
        value={location}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onLocation(e.target.value)}
      />
      {isFetching ? <Loader2 className="w-4 h-4 text-zinc-400 animate-spin shrink-0" /> : null}
      {showMenu && isDropdownOpen && suggestions.length > 0 ? (
        <ul className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50 max-h-60 overflow-y-auto">
          {suggestions.map((sug, index) => (
            <li key={`${sug.type}-${sug.text}-${index}`}>
              <button
                type="button"
                className="w-full px-4 py-3 hover:bg-zinc-50 flex items-center gap-2 text-sm font-medium text-zinc-700 border-b border-zinc-50 last:border-0 text-left touch-manipulation"
                onPointerDown={(event) => {
                  event.preventDefault()
                  onPick(sug.text)
                }}
              >
                {sug.type === "location" && <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />}
                {sug.type === "title" && <Compass className="w-4 h-4 text-zinc-400 shrink-0" />}
                {sug.type === "category" && <Hash className="w-4 h-4 text-zinc-400 shrink-0" />}
                <span className="truncate">{sug.text}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function SearchRowActions({ sort, onSort }: { sort: string; onSort: (sort: string) => void }) {
  return (
    <>
      <div className="relative h-8 w-8 shrink-0 flex items-center justify-center rounded-full text-zinc-500 active:bg-zinc-100 touch-manipulation">
        <SlidersHorizontal className="w-4 h-4" />
        <select
          value={sort}
          onChange={(e) => onSort(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Sort tours"
        >
          <option value="recommended">Recommended</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>
      <button
        type="submit"
        aria-label="Search"
        className="shrink-0 h-8 w-8 rounded-full bg-rose-500 text-white flex items-center justify-center touch-manipulation active:scale-95"
      >
        <Search className="w-4 h-4" />
      </button>
    </>
  )
}

export function MobileSearch({
  dynamicCategories = [],
  categoryMap,
}: {
  dynamicCategories?: HomepageCategory[]
  categoryMap?: HomepageCategoryMap
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const hydrateCategories = useHomeBrowseStore((s) => s.hydrateCategories)

  useEffect(() => {
    if (categoryMap) hydrateCategories(categoryMap)
  }, [categoryMap, hydrateCategories])

  const [location, setLocation] = useState(searchParams.get("location") || "")
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
  const [stuck, setStuck] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const chromeHidden = useMobileChromeStore((s) => s.hidden)
  const setStuckChrome = useMobileChromeStore((s) => s.setStuck)
  const lockChrome = useMobileChromeStore((s) => s.lock)
  const unlockChrome = useMobileChromeStore((s) => s.unlock)
  const searchLockRef = useRef(false)

  const debouncedLocation = useDebounce(location, 220)

  function holdSearchLock() {
    if (searchLockRef.current) return
    searchLockRef.current = true
    lockChrome()
  }

  function releaseSearchLock() {
    if (!searchLockRef.current) return
    searchLockRef.current = false
    unlockChrome()
  }

  useEffect(() => {
    return () => releaseSearchLock()
  }, [])

  useEffect(() => {
    if (isFocused) return
    setLocation(searchParams.get("location") || "")
  }, [searchParams, isFocused])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const update = () => {
      const next = peekHomeListingsPin() || el.getBoundingClientRect().top < 8
      setStuck(next)
      setStuckChrome(next)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    window.addEventListener("islandfull:listings-pin", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
      window.removeEventListener("islandfull:listings-pin", update)
      setStuckChrome(false)
    }
  }, [setStuckChrome])

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
      setIsDropdownOpen(isFocused && results.length > 0)
      setIsFetching(false)
    }
    if (isFocused) fetchSuggestions()
  }, [debouncedLocation, isFocused])

  function goTo(nextLocation: string) {
    const params = new URLSearchParams(searchParams.toString())
    const value = nextLocation.trim()
    if (value) params.set("location", value)
    else params.delete("location")
    writeTripSearchToParams(params, { date: tripDate, guests: tripGuests, children: tripChildren, infants: tripInfants })
    params.delete("category")
    const sortVal = searchParams.get("sort")
    if (sortVal) params.set("sort", sortVal)
    setIsDropdownOpen(false)
    setIsFocused(false)
    releaseSearchLock()
    markHomeListingsPin()
    startTransition(() => {
      router.push(listingsHref(pathname, params), { scroll: false })
    })
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    goTo(location)
  }

  function pickSuggestion(text: string) {
    setLocation(text)
    goTo(text)
  }

  const whereProps = {
    location,
    isFetching,
    suggestions,
    isDropdownOpen,
    onLocation: (val: string) => {
      setLocation(val)
      if (val === "" && searchParams.get("location")) goTo("")
    },
    onFocus: () => {
      setIsFocused(true)
      holdSearchLock()
      if (suggestions.length > 0) setIsDropdownOpen(true)
    },
    onBlur: () => {
      window.setTimeout(() => {
        setIsFocused(false)
        setIsDropdownOpen(false)
        releaseSearchLock()
      }, 120)
    },
    onPick: pickSuggestion,
  }

  const sortValue = parseTourSort(searchParams.get("sort"))
  function onSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (!sort || sort === "recommended") params.delete("sort")
    else params.set("sort", sort)
    markHomeListingsPin()
    router.push(listingsHref(pathname, params), { scroll: false })
  }

  return (
    <>
      <div
        ref={cardRef}
        data-home-search-card
        className={`sm:hidden px-4 -mt-5 relative z-20 w-full ${stuck ? "invisible pointer-events-none" : ""}`}
      >
        <form onSubmit={handleSearch} className="bg-white rounded-full shadow-md">
          <div className="flex items-center h-11 rounded-full border border-zinc-200 pl-3.5 pr-1 gap-1 focus-within:border-rose-400">
            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
            <WhereField {...whereProps} showMenu={!stuck} />
            {!isFocused ? (
              <>
                <DateSearchField chip />
                <GuestsSearchField chip />
              </>
            ) : null}
            <SearchRowActions sort={sortValue} onSort={onSort} />
          </div>
        </form>
      </div>

      <div
        id="home-browse"
        className={`sm:hidden pt-4 pb-2 ${stuck ? "invisible pointer-events-none" : ""}`}
        aria-hidden={stuck}
      >
        <div className="pl-3 pr-2">
          <HomeCategoryChips dynamicCategories={dynamicCategories} passive={stuck} />
        </div>
      </div>

      {stuck && (
        <div
          ref={stickyRef}
          data-home-sticky
          className={`sm:hidden fixed inset-x-0 top-0 z-30 pt-[env(safe-area-inset-top)] bg-white border-b border-zinc-200/80 transition-transform duration-300 ease-out will-change-transform ${
            chromeHidden ? "-translate-y-full pointer-events-none" : "translate-y-0"
          }`}
        >
          <div className="flex items-center gap-2 px-3 pt-2 pb-2">
            <form onSubmit={handleSearch} className="min-w-0 flex-1">
              <div className="relative flex items-center h-10 rounded-full border border-zinc-200 bg-white shadow-sm pl-3 pr-1 gap-1">
                <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <WhereField {...whereProps} showMenu={stuck} />
                {!isFocused ? (
                  <>
                    <DateSearchField chip />
                    <GuestsSearchField chip />
                  </>
                ) : null}
                <SearchRowActions sort={sortValue} onSort={onSort} />
              </div>
            </form>
            <UserNavMenu
              triggerClassName="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center cursor-pointer touch-manipulation active:scale-95 overflow-hidden"
              iconClassName="w-4 h-4 text-zinc-700"
            />
          </div>
        </div>
      )}
    </>
  )
}
