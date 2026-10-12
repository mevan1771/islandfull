"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { BedDouble, Bike, Calendar, Map } from "lucide-react"

const VERTICALS = [
  { id: "tour", label: "Tours", Icon: Map },
  { id: "event", label: "Events", Icon: Calendar },
  { id: "transport", label: "Transport", Icon: Bike },
  { id: "hotel", label: "Hotels", Icon: BedDouble },
] as const

type VerticalId = (typeof VERTICALS)[number]["id"]

function isVertical(value: string | null): value is VerticalId {
  return VERTICALS.some((item) => item.id === value)
}

export function HomeVerticalBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const paramVertical = searchParams.get("vertical")
  const urlVertical: VerticalId = isVertical(paramVertical) ? paramVertical : "tour"
  const [active, setActive] = useState<VerticalId>(urlVertical)

  useEffect(() => {
    setActive(urlVertical)
  }, [urlVertical])

  useEffect(() => {
    const grid = document.getElementById("activity-grid-container")
    if (!grid) return
    grid.style.opacity = isPending ? "0.5" : "1"
    grid.style.pointerEvents = isPending ? "none" : "auto"
    grid.style.transition = "opacity 0.2s"
  }, [isPending])

  const handleClick = (vertical: VerticalId) => {
    if (vertical === active) {
      document.getElementById("activity-grid-container")?.scrollIntoView({ behavior: "smooth", block: "start" })
      return
    }

    setActive(vertical)
    const params = new URLSearchParams(searchParams.toString())
    params.set("vertical", vertical)
    params.delete("category")
    startTransition(() => {
      router.push(`/?${params.toString()}`, { scroll: false })
    })
  }

  return (
    <nav
      className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-white/95 backdrop-blur-md shadow-[0_-8px_24px_-16px_rgba(0,0,0,0.28)] pb-[env(safe-area-inset-bottom)]"
      aria-label="Browse"
    >
      <div className="grid grid-cols-4 h-16">
        {VERTICALS.map(({ id, label, Icon }) => {
          const selected = active === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              aria-current={selected ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 cursor-pointer touch-manipulation select-none transition-transform duration-150 active:scale-[0.92] ${
                selected ? "text-rose-500" : "text-zinc-400"
              }`}
            >
              <Icon className={`w-5 h-5 ${selected ? "stroke-[2.4]" : "stroke-[1.75]"}`} />
              <span className={`text-[10px] leading-none tracking-wide ${selected ? "font-bold" : "font-semibold"}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
