"use client";

import Link from "next/link";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";
import type { MapTour } from "@/components/map/InteractiveMap";

const DESTINATIONS = [
  { id: 1, name: 'Galle', activities: 14, image: 'https://images.unsplash.com/photo-1546853020-caa2b66255a5?q=80&w=800&auto=format&fit=crop', lat: 6.0328, lng: 80.2170 },
  { id: 2, name: 'Sigiriya', activities: 8, image: 'https://images.unsplash.com/photo-1588614959060-4d144f28b207?q=80&w=800&auto=format&fit=crop', lat: 7.9570, lng: 80.7603 },
  { id: 3, name: 'Weligama', activities: 22, image: 'https://images.unsplash.com/photo-1579430132386-db9a1a720dd3?q=80&w=800&auto=format&fit=crop', lat: 5.9739, lng: 80.4284 },
  { id: 4, name: 'Yala', activities: 12, image: 'https://images.unsplash.com/photo-1610993302487-6db2bfdd8e2a?q=80&w=800&auto=format&fit=crop', lat: 6.3770, lng: 81.5030 },
];

export default function DestinationsPage() {
  const mapData: MapTour[] = DESTINATIONS.map((d) => ({
    id: d.name.toLowerCase(),
    title: d.name,
    location: d.name,
    price_usd: 0,
    cover_image_url: d.image,
    duration: "",
    category: "destination",
    category_type: "destination",
    latitude: d.lat,
    longitude: d.lng,
  }));

  return (
    <div className="flex w-full h-[calc(100vh-80px)] mt-[80px] overflow-hidden bg-white">
      
      {/* LEFT PANEL - Scrollable Feed */}
      <div className="w-full lg:w-[60%] h-full overflow-y-auto p-6 md:p-10 [&::-webkit-scrollbar]:hidden">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-zinc-900">Explore Sri Lanka</h1>
          <p className="text-zinc-500 mt-2">Discover the island's most iconic destinations and hidden gems.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {DESTINATIONS.map((dest) => (
            <Link className="relative h-72 rounded-2xl overflow-hidden group block shadow-sm hover:shadow-md transition-shadow" href={`/destinations/${dest.name.toLowerCase()}`} key={dest.id}>
              {/* Using standard img to bypass next/image config blocks */}
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              
              <div className="absolute bottom-5 left-5">
                <h2 className="text-white text-2xl font-bold drop-shadow-md">{dest.name}</h2>
                <span className="inline-block mt-2 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-white text-xs font-medium">
                  {dest.activities} Activities
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - Sticky Map */}
      <div className="hidden lg:block lg:w-[40%] h-full relative bg-zinc-900">
         <MapClientWrapper tours={mapData} isDestinationMode={true} />
      </div>

    </div>
  );
}
