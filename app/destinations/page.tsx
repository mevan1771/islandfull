"use client";

import { useState } from "react";
import { destinations } from "@/lib/data/destinations";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";
import type { MapTour } from "@/components/map/InteractiveMap";
import { Map, List } from "lucide-react";
import Image from "next/image";

export default function DestinationsPage() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Format destinations for the Map component
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
    <div className="w-full flex flex-col min-h-screen bg-zinc-50 relative pt-16">
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1600px] mx-auto w-full">
        {/* Left Panel: Destinations List */}
        <div 
          className={`w-full lg:w-[60%] flex-col overflow-y-auto h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] p-4 md:p-8 
            ${viewMode === "map" ? "hidden lg:flex" : "flex"}
          `}
        >
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-900 tracking-tight">Explore Sri Lanka</h1>
            <p className="text-zinc-500 mt-2 text-base md:text-lg">Discover the island's most iconic destinations and hubs.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {destinations.map((dest) => (
              <div 
                key={dest.id} 
                className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 block"
              >
                <Image
                  src={dest.image_url}
                  alt={dest.name}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
                
                <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-rose-400 transition-colors">{dest.name}</h3>
                  <div className="inline-block bg-white/20 backdrop-blur-md rounded-full px-3 py-1 text-xs font-semibold text-white w-max">
                    {dest.activityCount} Activities
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Map */}
        <div 
          className={`w-full lg:w-[40%] bg-zinc-900 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] h-[calc(100vh-4rem)]
            ${viewMode === "list" ? "hidden lg:block" : "block"}
          `}
        >
          <MapClientWrapper tours={mapData} isDestinationMode={true} />
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 text-white shadow-xl px-6 py-3 rounded-full flex items-center gap-2 text-sm font-semibold hover:scale-105 transition-all active:scale-95"
      >
        {viewMode === "list" ? (
          <>
            <Map className="w-4 h-4" /> Map
          </>
        ) : (
          <>
            <List className="w-4 h-4" /> List
          </>
        )}
      </button>
    </div>
  );
}
