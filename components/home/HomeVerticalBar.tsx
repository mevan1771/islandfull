"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { markHomeListingsPin, scrollHomeListingsToStart } from "@/lib/home-scroll"
import { useMobileChromeStore } from "@/store/useMobileChromeStore"
import { useSyncMobileChrome } from "@/hooks/useSyncMobileChrome"

const ICON_V = "20261019b"

const VERTICALS = [
  { id: "tour", label: "Tours", src: `/images/icons/tour-icon.jpg?v=${ICON_V}` },
  { id: "transport", label: "Transport", src: `/images/icons/Transport-icon.jpg?v=${ICON_V}` },
  { id: "hotel", label: "Hotels", src: `/images/icons/hotel-icon.jpg?v=${ICON_V}` },
] as const

type VerticalId = (typeof VERTICALS)[number]["id"]

function isVertical(value: string | null): value is VerticalId {
  return VERTICALS.some((item) => item.id === value)
}

const tapClass =
  "flex flex-col items-center justify-center gap-0.5 h-16 cursor-pointer touch-manipulation select-none active:scale-[0.88] transition-transform duration-75"

function BarIcon({ src, selected }: { src: string; selected: boolean }) {
  return (
    // Native img so Next/Image does not wrap these JPGs in a square tile.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={72}
      height={72}
      className={`h-9 w-9 bg-transparent object-contain mix-blend-multiply transition-transform duration-150 ${
        selected ? "scale-110" : ""
      }`}
    />
  )
}

export function HomeVerticalBar() {
  useSyncMobileChrome()
  const chromeHidden = useMobileChromeStore((s) => s.hidden)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const onHome = pathname === "/"
  const onExplore = pathname.startsWith("/destinations")
  const onMap = pathname.startsWith("/map")
  const paramVertical = searchParams.get("vertical")
  const urlVertical: VerticalId = isVertical(paramVertical) ? paramVertical : "tour"
  const [active, setActive] = useState<VerticalId>(urlVertical)

  useEffect(() => {
    setActive(urlVertical)
  }, [urlVertical])

  useEffect(() => {
    router.prefetch("/map")
    router.prefetch("/trips")
    router.prefetch("/destinations")
  }, [router])

  const handleClick = (vertical: VerticalId) => {
    if (onHome && vertical === active) {
      markHomeListingsPin()
      scrollHomeListingsToStart({ blockClicks: false })
      return
    }

    setActive(vertical)
    markHomeListingsPin()
    const params = new URLSearchParams(onHome ? searchParams.toString() : "")
    params.set("vertical", vertical)
    params.delete("category")
    router.push(`/?${params.toString()}`, { scroll: false })
  }

  return (
    <nav
      className={`sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#EBEBEB] bg-[#FFFFFF] pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ease-out will-change-transform ${
        chromeHidden ? "translate-y-full pointer-events-none" : "translate-y-0"
      }`}
      aria-label="Browse"
    >
      <div className="grid grid-cols-5">
        {VERTICALS.map(({ id, label, src }) => {
          const selected = onHome && active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              aria-current={selected ? "page" : undefined}
              className={`${tapClass} ${selected ? "text-zinc-900" : "text-zinc-400"}`}
            >
              <BarIcon src={src} selected={selected} />
              <span className={`text-[10px] leading-none tracking-wide ${selected ? "font-bold" : "font-semibold"}`}>
                {label}
              </span>
            </button>
          )
        })}
        <Link
          href="/destinations"
          prefetch
          className={`${tapClass} ${onExplore ? "text-zinc-900" : "text-zinc-400"}`}
          aria-current={onExplore ? "page" : undefined}
        >
          <BarIcon src={`/images/icons/Explore-icon.jpg?v=${ICON_V}`} selected={onExplore} />
          <span className={`text-[10px] leading-none tracking-wide ${onExplore ? "font-bold" : "font-semibold"}`}>
            Explore
          </span>
        </Link>
        <Link
          href="/map"
          prefetch
          className={`${tapClass} ${onMap ? "text-zinc-900" : "text-zinc-400"}`}
          aria-label="Explore map"
          aria-current={onMap ? "page" : undefined}
        >
          <BarIcon src={`/images/icons/Map-icon.jpg?v=${ICON_V}`} selected={onMap} />
          <span className={`text-[10px] leading-none tracking-wide ${onMap ? "font-bold" : "font-semibold"}`}>Map</span>
        </Link>
      </div>
    </nav>
  )
}
