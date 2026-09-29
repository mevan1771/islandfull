"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

function dist(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

function ZoomableImage({
  src,
  alt,
  active,
  onZoomChange,
}: {
  src: string
  alt: string
  active: boolean
  onZoomChange: (zoomed: boolean) => void
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef(1)
  const posRef = useRef({ x: 0, y: 0 })
  const [scale, setScale] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const pinchStart = useRef<number | null>(null)
  const pinchScale = useRef(1)
  const panStart = useRef<{ x: number; y: number; px: number; py: number } | null>(null)
  const lastTap = useRef(0)
  const moving = useRef(false)
  const onZoomChangeRef = useRef(onZoomChange)
  onZoomChangeRef.current = onZoomChange
  const activeRef = useRef(active)
  activeRef.current = active

  const commitScale = (next: number) => {
    const clamped = Math.min(4, Math.max(1, next))
    scaleRef.current = clamped
    setScale(clamped)
    const zoomed = clamped > 1.02
    if (!zoomed) {
      posRef.current = { x: 0, y: 0 }
      setPos({ x: 0, y: 0 })
    }
    onZoomChangeRef.current(zoomed)
  }

  useEffect(() => {
    if (!active) {
      scaleRef.current = 1
      posRef.current = { x: 0, y: 0 }
      pinchStart.current = null
      panStart.current = null
      moving.current = false
      setScale(1)
      setPos({ x: 0, y: 0 })
      onZoomChangeRef.current(false)
    }
  }, [active, src])

  useEffect(() => {
    const node = wrapRef.current
    if (!node) return

    const onStart = (event: TouchEvent) => {
      if (!activeRef.current) return
      if (event.touches.length === 2) {
        pinchStart.current = dist(event.touches[0], event.touches[1])
        pinchScale.current = scaleRef.current
        panStart.current = null
        moving.current = true
        return
      }
      if (event.touches.length === 1 && scaleRef.current > 1.02) {
        panStart.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
          px: posRef.current.x,
          py: posRef.current.y,
        }
        moving.current = true
      }
    }

    const onMove = (event: TouchEvent) => {
      if (!activeRef.current) return
      if (event.touches.length === 2 && pinchStart.current) {
        event.preventDefault()
        commitScale(pinchScale.current * (dist(event.touches[0], event.touches[1]) / pinchStart.current))
        return
      }
      if (event.touches.length === 1 && panStart.current && scaleRef.current > 1.02) {
        event.preventDefault()
        const next = {
          x: panStart.current.px + (event.touches[0].clientX - panStart.current.x),
          y: panStart.current.py + (event.touches[0].clientY - panStart.current.y),
        }
        posRef.current = next
        setPos(next)
      }
    }

    const onEnd = (event: TouchEvent) => {
      if (!activeRef.current) return
      if (event.touches.length < 2) pinchStart.current = null
      if (event.touches.length === 0) {
        panStart.current = null
        moving.current = false
      }
      if (event.changedTouches.length === 1 && event.touches.length === 0 && scaleRef.current <= 1.02) {
        const now = Date.now()
        if (now - lastTap.current < 280) {
          commitScale(2.4)
          lastTap.current = 0
        } else {
          lastTap.current = now
        }
      }
      if (scaleRef.current <= 1.02) commitScale(1)
    }

    node.addEventListener("touchstart", onStart, { passive: true })
    node.addEventListener("touchmove", onMove, { passive: false })
    node.addEventListener("touchend", onEnd, { passive: true })
    node.addEventListener("touchcancel", onEnd, { passive: true })
    return () => {
      node.removeEventListener("touchstart", onStart)
      node.removeEventListener("touchmove", onMove)
      node.removeEventListener("touchend", onEnd)
      node.removeEventListener("touchcancel", onEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={wrapRef} className="relative flex h-full w-full items-center justify-center overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="h-full w-full object-contain select-none"
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`,
          transformOrigin: "center center",
          transition: moving.current ? "none" : "transform 160ms ease-out",
        }}
        onDoubleClick={(event) => {
          if (!active) return
          event.preventDefault()
          commitScale(scaleRef.current > 1.02 ? 1 : 2.4)
        }}
      />
    </div>
  )
}

export function PhotoLightbox({
  urls,
  startIndex,
  onClose,
  alt = "Photo",
}: {
  urls: string[]
  startIndex: number
  onClose: () => void
  alt?: string
}) {
  const [index, setIndex] = useState(startIndex)
  const [zoomed, setZoomed] = useState(false)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const slideRefs = useRef<(HTMLDivElement | null)[]>([])
  const indexRef = useRef(startIndex)
  const zoomedRef = useRef(false)
  indexRef.current = index
  zoomedRef.current = zoomed

  const go = (delta: number) => {
    const node = scrollerRef.current
    if (!node || zoomedRef.current) return
    const next = Math.min(urls.length - 1, Math.max(0, indexRef.current + delta))
    node.scrollTo({ left: node.clientWidth * next, behavior: "smooth" })
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const node = scrollerRef.current
    if (node) node.scrollLeft = node.clientWidth * startIndex

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowRight") go(1)
      if (event.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const root = scrollerRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const next = Number(entry.target.getAttribute("data-index"))
          if (!Number.isNaN(next)) setIndex(next)
        })
      },
      { root, threshold: 0.55 }
    )
    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide)
    })
    return () => observer.disconnect()
  }, [urls.length])

  if (typeof document === "undefined") return null

  return createPortal(
    <div className="fixed inset-0 z-[999999] bg-zinc-950 text-white h-[100dvh] w-screen overflow-hidden">
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <span className="pointer-events-auto text-xs font-semibold tracking-wide bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
          {index + 1} / {urls.length}
        </span>
        <button
          type="button"
          aria-label="Close photos"
          onClick={onClose}
          className="pointer-events-auto flex items-center justify-center min-w-11 min-h-11 rounded-full bg-black/40 backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div
        ref={scrollerRef}
        className={`flex w-full h-full ${
          zoomed
            ? "overflow-hidden"
            : "overflow-x-auto snap-x snap-mandatory overscroll-x-contain"
        } [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`}
      >
        {urls.map((url, i) => (
          <div
            key={url + i}
            data-index={i}
            ref={(el) => {
              slideRefs.current[i] = el
            }}
            className="w-full h-full min-w-full shrink-0 snap-center snap-always"
          >
            <ZoomableImage
              src={url}
              alt={i === 0 ? alt : `${alt} ${i + 1}`}
              active={i === index}
              onZoomChange={setZoomed}
            />
          </div>
        ))}
      </div>

      {urls.length > 1 && (
        <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] inset-x-0 z-20 flex justify-center gap-1.5 pointer-events-none">
          {urls.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-white" : "w-1.5 bg-white/35"
              }`}
            />
          ))}
        </div>
      )}

      {index > 0 && (
        <button
          type="button"
          aria-label="Previous photo"
          onClick={() => go(-1)}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-11 h-11 rounded-full bg-black/40 text-white"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {index < urls.length - 1 && (
        <button
          type="button"
          aria-label="Next photo"
          onClick={() => go(1)}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 items-center justify-center w-11 h-11 rounded-full bg-black/40 text-white"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>,
    document.body
  )
}
