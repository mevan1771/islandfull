"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, MapPin, Loader2, Compass, Hash } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { searchLocationsAndTags, type SearchSuggestion } from "@/app/actions/search"
import { parseTourSort } from "@/lib/tour-sort"
import { HomeCategoryChips } from "@/components/home/HomeCategoryChips"
import type { HomepageCategory, HomepageCategoryMap } from "@/lib/homepage-feed"
import { useHomeBrowseStore } from "@/store/useHomeBrowseStore"
import { markHomeListingsPin } from "@/lib/home-scroll"
import { useMobileChromeStore } from "@/store/useMobileChromeStore"
import { listingsHref } from "@/lib/listing-path"
import { readTripSearchFromParams, writeTripSearchToParams } from "@/lib/trip-search"
import { MobileTripChips, MobileTripSheet } from "@/components/home/TripSearchControls"
import { SortMenu } from "@/components/home/SortMenu"
import { ensureTripSearchHydrated, useTripSearchStore } from "@/store/useTripSearchStore"
import { useExploreMapStore } from "@/store/useExploreMapStore"

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
      <SortMenu sort={sort} onSort={onSort} size="sm" />
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
  const mapOpen = useExploreMapStore((s) => s.open)
  const [stuck, setStuck] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const [tripSheet, setTripSheet] = useState<"date" | "guests" | null>(null)
  const stuckRef = useRef(false)
  const atTopRef = useRef(true)
  const slotRef = useRef<HTMLDivElement>(null)
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
    if (mapOpen) {
      stuckRef.current = false
      atTopRef.current = true
      setStuck(false)
      setAtTop(true)
      setStuckChrome(false)
      return
    }
    let ticking = false
    const update = () => {
      if (useExploreMapStore.getState().open) return
      const y = window.scrollY
      const nextAtTop = y <= 16
      const nextStuck = y > 24
      if (atTopRef.current !== nextAtTop) {
        atTopRef.current = nextAtTop
        setAtTop(nextAtTop)
      }
      if (stuckRef.current !== nextStuck) {
        stuckRef.current = nextStuck
        setStuck(nextStuck)
        setStuckChrome(nextStuck)
      }
    }
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        ticking = false
        update()
      })
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    window.addEventListener("islandfull:listings-pin", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("islandfull:listings-pin", onScroll)
      setStuckChrome(false)
    }
  }, [mapOpen, setStuckChrome])

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
        ref={slotRef}
        data-home-search-card
        className={`sm:hidden ${mapOpen ? "hidden" : "h-[6.75rem]"}`}
        aria-hidden
      />
      <div
        className={`sm:hidden fixed inset-x-0 z-30 bg-background px-4 pt-3 pb-1 transition-[transform,top] duration-200 ease-out ${
          mapOpen
            ? "hidden"
            : atTop
              ? "top-12 translate-y-0"
              : chromeHidden
                ? "top-0 -translate-y-full pointer-events-none"
                : "top-0 translate-y-0"
        }`}
      >
        <form onSubmit={handleSearch} className="bg-white rounded-full shadow-[0_8px_24px_rgba(15,23,42,0.10)]">
          <div className="flex min-w-0 items-center h-11 overflow-hidden rounded-full border border-zinc-200 pl-3.5 pr-1 gap-1 focus-within:border-rose-400">
            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
            <WhereField {...whereProps} showMenu />
            <MobileTripChips
              onOpenDate={() => setTripSheet("date")}
              onOpenGuests={() => setTripSheet("guests")}
            />
            <SearchRowActions sort={sortValue} onSort={onSort} />
          </div>
        </form>
      </div>

      <div id="home-browse" className={`sm:hidden relative z-10 min-w-0 overflow-x-auto pt-5 pb-2 ${mapOpen ? "hidden" : ""}`}>
        <div className="min-w-0 pl-3 pr-2">
          <HomeCategoryChips dynamicCategories={dynamicCategories} passive={stuck} />
        </div>
      </div>
      <MobileTripSheet tab={tripSheet} onClose={() => setTripSheet(null)} />
    </>
  )
}
