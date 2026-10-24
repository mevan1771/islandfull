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

function makeArrowImage() {
  const size = 96
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  ctx.clearRect(0, 0, size, size)
  ctx.translate(size / 2, size / 2)
  ctx.fillStyle = "#fff"
  ctx.strokeStyle = "#e11d48"
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(-18, -16)
  ctx.lineTo(20, 0)
  ctx.lineTo(-18, 16)
  ctx.lineTo(-8, 0)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  return ctx.getImageData(0, 0, size, size)
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
  const animRef = useRef<number>(0)

  useEffect(() => {
    if (!TOKEN || !container.current || mapRef.current) return
    mapboxgl.accessToken = TOKEN
    const map = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: CENTER,
      zoom: 5.85,
      minZoom: 5.4,
      maxZoom: 11,
      maxBounds: MAX_BOUNDS,
      attributionControl: false,
      cooperativeGestures: false,
      pitch: 0,
    })
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right")
    const resize = () => map.resize()
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
        paint: { "line-color": "#fff7cc", "line-width": 10, "line-opacity": 0.35, "line-blur": 2 },
      })
      map.addLayer({
        id: "trip-route-line",
        type: "line",
        source: "trip-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-width": 4.5,
          "line-opacity": 0.95,
          "line-gradient": [
            "interpolate",
            ["linear"],
            ["line-progress"],
            0,
            "#FFC72C",
            0.45,
            "#fb7185",
            1,
            "#e11d48",
          ],
        },
      })
      map.addLayer({
        id: "trip-route-dash",
        type: "line",
        source: "trip-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#ffffff",
          "line-width": 2,
          "line-opacity": 0.85,
          "line-dasharray": [0, 1.6, 1.2],
        },
      })
      const arrow = makeArrowImage()
      if (arrow && !map.hasImage("route-arrow")) map.addImage("route-arrow", arrow, { pixelRatio: 2 })
      map.addLayer({
        id: "trip-route-arrows",
        type: "symbol",
        source: "trip-route",
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 56,
          "icon-image": "route-arrow",
          "icon-size": 0.38,
          "icon-rotation-alignment": "map",
          "icon-pitch-alignment": "map",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
        },
      })
      let dash = 0
      const tick = () => {
        dash = (dash + 0.08) % 3.2
        if (map.getLayer("trip-route-dash")) {
          map.setPaintProperty("trip-route-dash", "line-dasharray", [0, Math.max(0.2, dash), 1.4])
        }
        animRef.current = requestAnimationFrame(tick)
      }
      animRef.current = requestAnimationFrame(tick)
      ROUTE_STOPS.forEach((stop) => {
        const el = document.createElement("div")
        el.style.width = "44px"
        el.style.height = "56px"
        el.style.pointerEvents = "auto"
        el.addEventListener("click", (event) => {
          event.stopPropagation()
          const current = stopsRef.current
          const last = current[current.length - 1]
          if (last?.id === stop.id) onRemoveRef.current(stop.id)
          else if (!current.some((item) => item.id === stop.id)) onAddRef.current(stop)
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
    const observer = typeof ResizeObserver !== "undefined" && container.current
      ? new ResizeObserver(() => resize())
      : null
    if (observer && container.current) observer.observe(container.current)
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener("resize", resize)
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
    ;(["trip-route-halo", "trip-route-line", "trip-route-dash", "trip-route-arrows"] as const).forEach((id) => {
      if (map?.getLayer(id)) map.setLayoutProperty(id, "visibility", show ? "visible" : "none")
    })
    if (!map || stops.length === 0) return
    if (stops.length === 1) {
      map.easeTo({ center: [stops[0].lng, stops[0].lat], zoom: Math.max(map.getZoom(), 7.4), duration: 500 })
      return
    }
    const bounds = new mapboxgl.LngLatBounds()
    stops.forEach((stop) => bounds.extend([stop.lng, stop.lat]))
    map.fitBounds(bounds, {
      padding: { top: 72, bottom: 88, left: 56, right: 72 },
      maxZoom: 8.2,
      duration: 600,
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
      <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        {stops.length < 2 ? "Tap a place on the island to add it" : "Tap another pin to extend the route"}
      </p>
    </div>
  )
}

function paintMarkers(stops: RouteStop[], refs: Record<string, { el: HTMLDivElement }>) {
  const order = new Map(stops.map((stop, index) => [stop.id, index + 1]))
  Object.entries(refs).forEach(([id, { el }]) => {
    const stop = ROUTE_STOPS.find((item) => item.id === id)
    if (!stop) return
    const n = order.get(id)
    const selected = Boolean(n)
    el.style.width = "44px"
    el.style.height = "56px"
    el.style.zIndex = selected ? "20" : "2"
    el.innerHTML = `
      <button type="button" class="group relative flex h-11 w-11 cursor-pointer items-center justify-center" aria-label="${stop.name}">
        <span class="block h-11 w-11 overflow-hidden rounded-full border-2 shadow-lg transition-transform ${
          selected ? "border-rose-500 scale-110" : "border-white hover:scale-105"
        }">
          <img src="${stop.image || ""}" alt="" class="h-full w-full object-cover" />
        </span>
        ${
          selected
            ? `<span class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">${n}</span>`
            : ""
        }
        <span class="pointer-events-none absolute left-1/2 top-[calc(100%+4px)] z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white group-hover:block">${stop.name}</span>
      </button>
    `
  })
}
