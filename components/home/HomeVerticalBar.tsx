"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { BedDouble, Bike, Globe, Map } from "lucide-react"
import { UserNavMenu } from "@/components/layout/UserNavMenu"
import { markHomeListingsPin, scrollHomeListingsToStart } from "@/lib/home-scroll"

const VERTICALS = [
  { id: "tour", label: "Tours", Icon: Map },
  { id: "transport", label: "Transport", Icon: Bike },
  { id: "hotel", label: "Hotels", Icon: BedDouble },
] as const

type VerticalId = (typeof VERTICALS)[number]["id"]

function isVertical(value: string | null): value is VerticalId {
  return VERTICALS.some((item) => item.id === value)
}

const tapClass =
  "flex flex-col items-center justify-center gap-1 h-16 cursor-pointer touch-manipulation select-none active:scale-[0.88] transition-transform duration-75"

export function HomeVerticalBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramVertical = searchParams.get("vertical")
  const urlVertical: VerticalId = isVertical(paramVertical) ? paramVertical : "tour"
  const [active, setActive] = useState<VerticalId>(urlVertical)

  useEffect(() => {
    setActive(urlVertical)
  }, [urlVertical])

  useEffect(() => {
    router.prefetch("/map")
    router.prefetch("/trips")
  }, [router])

  const handleClick = (vertical: VerticalId) => {
    if (vertical === active) {
      markHomeListingsPin()
      scrollHomeListingsToStart({ blockClicks: false })
      return
    }

    setActive(vertical)
    markHomeListingsPin()
    scrollHomeListingsToStart({ blockClicks: false })
    const params = new URLSearchParams(searchParams.toString())
    params.set("vertical", vertical)
    params.delete("category")
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <nav
      className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.28)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Browse"
    >
      <div className="grid grid-cols-5">
        {VERTICALS.map(({ id, label, Icon }) => {
          const selected = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              aria-current={selected ? "page" : undefined}
              className={`${tapClass} ${selected ? "text-rose-500" : "text-zinc-400"}`}
            >
              <Icon className={`w-5 h-5 ${selected ? "stroke-[2.4]" : "stroke-[1.75]"}`} />
              <span className={`text-[10px] leading-none tracking-wide ${selected ? "font-bold" : "font-semibold"}`}>
                {label}
              </span>
            </button>
          )
        })}
        <Link
          href="/map"
          prefetch
          className={`${tapClass} text-zinc-400`}
          aria-label="Explore map"
        >
          <Globe className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[10px] leading-none tracking-wide font-semibold">Map</span>
        </Link>
        <UserNavMenu layout="bar" />
      </div>
    </nav>
  )
}
