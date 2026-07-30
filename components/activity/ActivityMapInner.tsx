"use client"

import { MapContainer, TileLayer, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'

export default function ActivityMapInner({ lat, lng }: { lat: number, lng: number }) {
  // Fix Leaflet's default icon path issues even though we aren't using markers
  useEffect(() => {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    // @ts-ignore
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] rounded-3xl overflow-hidden shadow-sm border border-zinc-200">
      <MapContainer 
        center={[lat, lng]} 
        zoom={12} 
        scrollWheelZoom={false}
        dragging={false}
        attributionControl={false}
        className="w-full h-full min-h-[300px] z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle 
          center={[lat, lng]} 
          radius={1500} // 1.5km radius
          pathOptions={{ 
            color: '#f43f5e', // rose-500
            fillColor: '#f43f5e',
            fillOpacity: 0.2,
            weight: 2
          }} 
        />
      </MapContainer>
    </div>
  )
}
