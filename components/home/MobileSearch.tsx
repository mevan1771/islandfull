"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Search, MapPin, Loader2, SlidersHorizontal, Compass, Hash } from "lucide-react"
import locationPin from "@/components/ui/Location icon/354556546.jpg"
import { useDebounce } from "@/hooks/useDebounce"
import { searchLocationsAndTags, type SearchSuggestion } from "@/app/actions/search"
import { parseTourSort } from "@/lib/tour-sort"
import { HomeCategoryChips } from "@/components/home/HomeCategoryChips"
import { markHomeListingsPin, peekHomeListingsPin } from "@/lib/home-scroll"

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
      <Link
        href="/destinations"
        prefetch
        className="h-8 w-8 shrink-0 flex items-center justify-center rounded-full active:bg-zinc-100 touch-manipulation"
        aria-label="Destinations"
      >
        <Image src={locationPin} alt="" width={18} height={18} className="w-[18px] h-[18px] object-contain" />
      </Link>
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

export function MobileSearch({ dynamicCategories = [] }: { dynamicCategories?: { slug?: string; name?: string }[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [stuck, setStuck] = useState(() => peekHomeListingsPin())
  const cardRef = useRef<HTMLDivElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)

  const debouncedLocation = useDebounce(location, 220)

  useEffect(() => {
    if (isFocused) return
    setLocation(searchParams.get("location") || "")
  }, [searchParams, isFocused])

  useEffect(() => {
    const onPin = () => setStuck(true)
    window.addEventListener("islandfull:listings-pin", onPin)
    return () => window.removeEventListener("islandfull:listings-pin", onPin)
  }, [])

  useEffect(() => {
    const el = cardRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (peekHomeListingsPin()) {
          setStuck(true)
          return
        }
        setStuck(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: "-12px 0px 0px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

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
    params.delete("category")
    const sortVal = searchParams.get("sort")
    if (sortVal) params.set("sort", sortVal)
    setIsDropdownOpen(false)
    setIsFocused(false)
    markHomeListingsPin()
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
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
      if (suggestions.length > 0) setIsDropdownOpen(true)
    },
    onBlur: () => {
      window.setTimeout(() => {
        setIsFocused(false)
        setIsDropdownOpen(false)
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
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <>
      <div ref={cardRef} className="sm:hidden px-4 -mt-5 relative z-20 w-full">
        <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-md p-2">
          <div className="flex items-center h-11 rounded-full border border-zinc-200 bg-zinc-50 pl-3 pr-1 gap-0.5 focus-within:border-rose-400">
            <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
            <WhereField {...whereProps} showMenu={!stuck} />
            <SearchRowActions sort={sortValue} onSort={onSort} />
          </div>
        </form>
      </div>

      <div
        id="home-browse"
        className={`sm:hidden pt-3 pb-1 ${stuck ? "invisible pointer-events-none" : ""}`}
        aria-hidden={stuck}
      >
        <div className="pl-4 pr-3">
          <HomeCategoryChips dynamicCategories={dynamicCategories} compact passive={stuck} />
        </div>
      </div>

      {stuck && (
        <div
          ref={stickyRef}
          data-home-sticky
          className="sm:hidden fixed inset-x-0 top-0 z-30 pt-[env(safe-area-inset-top)] bg-white border-b border-zinc-200/80"
        >
          <form onSubmit={handleSearch} className="px-3 pt-2">
            <div className="relative flex items-center h-11 rounded-full border border-zinc-200 bg-white shadow-sm pl-3 pr-1 gap-0.5">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0" />
              <WhereField {...whereProps} showMenu={stuck} />
              <SearchRowActions sort={sortValue} onSort={onSort} />
            </div>
          </form>
          <div className="pl-4 pr-3 pt-2 pb-2">
            <HomeCategoryChips dynamicCategories={dynamicCategories} compact />
          </div>
        </div>
      )}
    </>
  )
}
