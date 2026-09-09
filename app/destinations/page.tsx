"use client";

import Image from "next/image";
import Link from "next/link";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";
import type { MapTour } from "@/components/map/InteractiveMap";

// 1. STATIC DATA ARRAY
const destinations = [
  {
    id: "galle",
    name: "Galle",
    image_url: "https://images.unsplash.com/photo-1546853020-caa2b66255a5?q=80&w=800&auto=format&fit=crop",
    lat: 6.0328,
    lng: 80.2170,
    activityCount: 14,
  },
  {
    id: "sigiriya",
    name: "Sigiriya",
    image_url: "https://images.unsplash.com/photo-1588614959060-4d144f28b207?q=80&w=800&auto=format&fit=crop",
    lat: 7.9570,
    lng: 80.7603,
    activityCount: 8,
  },
  {
    id: "weligama",
    name: "Weligama",
    image_url: "https://images.unsplash.com/photo-1579430132386-db9a1a720dd3?q=80&w=800&auto=format&fit=crop",
    lat: 5.9739,
    lng: 80.4284,
    activityCount: 22,
  },
  {
    id: "yala",
    name: "Yala",
    image_url: "https://images.unsplash.com/photo-1610993302487-6db2bfdd8e2a?q=80&w=800&auto=format&fit=crop",
    lat: 6.3770,
    lng: 81.5030,
    activityCount: 12,
  },
];

export default function DestinationsPage() {
  const mapData: MapTour[] = destinations.map((d) => ({
    id: d.id,
    title: d.name,
    location: d.name,
    price_usd: 0,
    cover_image_url: d.image_url,
    duration: "",
    category: "destination",
    category_type: "destination",
    latitude: d.lat,
    longitude: d.lng,
  }));

  return (
    <div className="flex w-full h-[calc(100vh-80px)] mt-[80px] overflow-hidden bg-gray-50">
      
      {/* LEFT PANEL: Scrollable Feed */}
      <div className="w-full lg:w-[55%] h-full overflow-y-auto p-4 md:p-8 [&::-webkit-scrollbar]:hidden">
        <h1 className="text-4xl font-bold text-zinc-900 mb-2">Explore Sri Lanka</h1>
        <p className="text-zinc-500 mb-8">Discover the island's most iconic destinations.</p>
        
        {/* BENTO GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {destinations.map((dest, index) => {
            const isPrimary = index === 0 || index === 3;
            return (
              <Link
                key={dest.id}
                href={`/destinations/${dest.id}`}
                className={`group relative rounded-2xl overflow-hidden bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-500 h-64 md:h-72 ${
                  isPrimary ? "md:col-span-2" : "md:col-span-1"
                }`}
              >
                <Image
                  src={dest.image_url}
                  alt={dest.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes={isPrimary ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-5">
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                    {dest.name}
                  </h3>
                  <span className="inline-block bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-xs font-semibold text-white">
                    {dest.activityCount} Activities
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* RIGHT PANEL: Sticky Map (Desktop Only) */}
      <div className="hidden lg:block lg:w-[45%] h-full relative border-l border-gray-200">
         <MapClientWrapper tours={mapData} isDestinationMode={true} />
      </div>

    </div>
  )
}
