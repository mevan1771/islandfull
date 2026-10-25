"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { ROUTE_STOPS, type RouteStop } from "@/lib/transport-route"

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
const CENTER: [number, number] = [80.65, 7.6]
const MAX_BOUNDS: [[number, number], [number, number]] = [
  [78.9, 5.4],
  [82.6, 10.3],
]

function curveSegment(from: [number, number], to: [number, number], flip: boolean) {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const dist = Math.hypot(dx, dy) || 1
  const nx = -dy / dist
  const ny = dx / dist
  const bulge = Math.min(0.55, dist * 0.28) * (flip ? -1 : 1)
  const cx = (from[0] + to[0]) / 2 + nx * bulge
  const cy = (from[1] + to[1]) / 2 + ny * bulge
  const steps = Math.max(16, Math.round(dist * 80))
  const coords: [number, number][] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const u = 1 - t
    coords.push([
      u * u * from[0] + 2 * u * t * cx + t * t * to[0],
      u * u * from[1] + 2 * u * t * cy + t * t * to[1],
    ])
  }
  return coords
}

function routeGeo(stops: RouteStop[]) {
  const coordinates: [number, number][] = []
  for (let i = 1; i < stops.length; i++) {
    const from: [number, number] = [stops[i - 1].lng, stops[i - 1].lat]
    const to: [number, number] = [stops[i].lng, stops[i].lat]
    const piece = curveSegment(from, to, i % 2 === 0)
    coordinates.push(...(i > 1 ? piece.slice(1) : piece))
  }
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "LineString" as const,
      coordinates: coordinates.length ? coordinates : [[CENTER[0], CENTER[1]]],
    },
  }
}

function isCompactMap() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches
}


export function RouteIslandMap({
  stops,
  onAdd,
  onRemoveLast,
  className = "",
}: {
  stops: RouteStop[]
  onAdd: (stop: RouteStop) => void
  onRemoveLast: (id: string) => void
  className?: string
}) {
  const container = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<Record<string, { marker: mapboxgl.Marker; el: HTMLDivElement }>>({})
  const stopsRef = useRef(stops)
  stopsRef.current = stops
  const onAddRef = useRef(onAdd)
  onAddRef.current = onAdd
  const onRemoveRef = useRef(onRemoveLast)
  onRemoveRef.current = onRemoveLast
  useEffect(() => {
    if (!TOKEN || !container.current || mapRef.current) return
    mapboxgl.accessToken = TOKEN
    const compact = isCompactMap()
    const map = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: CENTER,
      zoom: compact ? 5.55 : 5.85,
      minZoom: 5.35,
      maxZoom: 11,
      maxBounds: MAX_BOUNDS,
      attributionControl: false,
      cooperativeGestures: false,
      scrollZoom: !compact,
      pitch: 0,
    })
    if (compact) {
      map.setPadding({ top: 16, bottom: 24, left: 16, right: 16 })
    } else {
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right")
    }
    const resize = () => {
      map.resize()
      paintMarkers(stopsRef.current, markers.current)
    }
    map.on("load", () => {
      resize()
      requestAnimationFrame(resize)
      window.setTimeout(resize, 250)
      map.getCanvas().style.opacity = "1"
      map.addSource("trip-route", {
        type: "geojson",
        lineMetrics: true,
        data: routeGeo(stopsRef.current),
      })
      map.addLayer({
        id: "trip-route-halo",
        type: "line",
        source: "trip-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#18181b", "line-width": 7, "line-opacity": 0.45 },
      })
      map.addLayer({
        id: "trip-route-line",
        type: "line",
        source: "trip-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#ffffff", "line-width": 3, "line-opacity": 0.95 },
      })
      ROUTE_STOPS.forEach((stop) => {
        const el = document.createElement("div")
        el.style.pointerEvents = "auto"
        el.addEventListener("click", (event) => {
          event.stopPropagation()
          const current = stopsRef.current
          if (!current.some((item) => item.id === stop.id)) onAddRef.current(stop)
        })
        const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([stop.lng, stop.lat])
          .addTo(map)
        markers.current[stop.id] = { marker, el }
      })
      paintMarkers(stopsRef.current, markers.current)
      resize()
    })
    mapRef.current = map
    window.addEventListener("resize", resize)
    const media = window.matchMedia("(max-width: 1023px)")
    const onBreakpoint = () => paintMarkers(stopsRef.current, markers.current)
    media.addEventListener("change", onBreakpoint)
    let resizeTimer = 0
    const observer = typeof ResizeObserver !== "undefined" && container.current
      ? new ResizeObserver(() => {
          window.clearTimeout(resizeTimer)
          resizeTimer = window.setTimeout(resize, 120)
        })
      : null
    if (observer && container.current) observer.observe(container.current)
    return () => {
      window.removeEventListener("resize", resize)
      media.removeEventListener("change", onBreakpoint)
      observer?.disconnect()
      Object.values(markers.current).forEach(({ marker }) => marker.remove())
      markers.current = {}
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const source = map?.getSource("trip-route") as mapboxgl.GeoJSONSource | undefined
    source?.setData(routeGeo(stops))
    paintMarkers(stops, markers.current)
    const show = stops.length >= 2
    ;(["trip-route-halo", "trip-route-line"] as const).forEach((id) => {
      if (map?.getLayer(id)) map.setLayoutProperty(id, "visibility", show ? "visible" : "none")
    })
    if (!map) return
    const compact = isCompactMap()
    if (stops.length === 0) {
      map.easeTo({ center: CENTER, zoom: compact ? 5.55 : 5.85, duration: 600 })
      return
    }
    if (stops.length === 1) {
      map.easeTo({
        center: [stops[0].lng, stops[0].lat],
        zoom: compact ? 7.35 : 7.5,
        duration: 700,
      })
      return
    }
    const bounds = new mapboxgl.LngLatBounds()
    stops.forEach((stop) => bounds.extend([stop.lng, stop.lat]))
    map.fitBounds(bounds, {
      padding: compact
        ? { top: 44, bottom: 44, left: 28, right: 28 }
        : { top: 72, bottom: 88, left: 56, right: 72 },
      maxZoom: compact ? 8 : 8.2,
      duration: 750,
    })
  }, [stops])

  if (!TOKEN) {
    return (
      <div className={`flex items-center justify-center bg-zinc-200 text-sm text-zinc-500 ${className || "h-80 rounded-3xl"}`}>
        Map needs a Mapbox token
      </div>
    )
  }

  const staticMap = TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${CENTER[0]},${CENTER[1]},5.85,0/1000x700@2x?access_token=${TOKEN}`
    : ""

  return (
    <div
      className={`relative overflow-hidden bg-zinc-800 bg-cover bg-center ${className}`}
      style={staticMap ? { backgroundImage: `url(${staticMap})` } : undefined}
    >
      <div
        ref={container}
        className="h-full w-full bg-transparent [&_.mapboxgl-canvas]:opacity-0 [&_.mapboxgl-canvas]:transition-opacity [&_.mapboxgl-canvas]:duration-300"
      />
      {stops.length === 0 ? (
        <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          Tap a pin to add it
        </p>
      ) : null}
    </div>
  )
}

function paintMarkers(stops: RouteStop[], refs: Record<string, { el: HTMLDivElement }>) {
  const compact = isCompactMap()
  const size = compact ? 36 : 48
  Object.entries(refs).forEach(([id, { el }]) => {
    const stop = ROUTE_STOPS.find((item) => item.id === id)
    if (!stop) return
    const numbers = stops.flatMap((item, index) => (item.id === id ? [index + 1] : []))
    const selected = numbers.length > 0
    const label = numbers.join("·")
    el.style.zIndex = selected ? "30" : "5"
    el.style.width = `${size}px`
    el.style.height = `${size + 8}px`
    const border = selected ? "#18181b" : "#ffffff"
    const badgeWidth = Math.max(20, 10 + label.length * 7)
    const img = stop.image
      ? `<img src="${stop.image}" alt="" style="width:100%;height:100%;object-fit:cover;display:block" />`
      : `<span style="display:block;width:100%;height:100%;background:#d4d4d8"></span>`
    el.innerHTML = `
      <button type="button" aria-label="${stop.name}" title="${stop.name}" style="position:relative;display:block;width:${size}px;height:${size}px;padding:0;border:0;background:transparent;cursor:pointer">
        <span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;overflow:hidden;border:2.5px solid ${border};box-shadow:0 4px 14px rgba(0,0,0,.4);background:#fafafa">
          ${img}
        </span>
        ${
          selected
            ? `<span style="position:absolute;right:-4px;top:-4px;min-width:${badgeWidth}px;height:20px;padding:0 5px;border-radius:9999px;background:#18181b;color:#fff;font:700 10px/20px system-ui,sans-serif;text-align:center">${label}</span>`
            : ""
        }
      </button>
    `
  })
}
