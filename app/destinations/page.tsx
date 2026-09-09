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

  const destinationGroups = [
    {
      title: "The Coastal Route",
      destinations: destinations.filter((d) => ["galle", "weligama"].includes(d.id.toLowerCase())),
    },
    {
      title: "Cultural Triangle",
      destinations: destinations.filter((d) => ["sigiriya", "kandy"].includes(d.id.toLowerCase())),
    },
    {
      title: "Highlands & Wild",
      destinations: destinations.filter((d) => ["ella", "yala"].includes(d.id.toLowerCase())),
    },
  ];

  return (
    <div className="w-full flex flex-col min-h-screen bg-zinc-50 relative pt-[80px]">
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 gap-6">
        
        {/* Left Panel: Destinations List */}
        <div 
          className={`w-full lg:w-[55%] flex-col overflow-y-auto h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] pb-24 lg:pr-4
            ${viewMode === "map" ? "hidden lg:flex" : "flex"}
            [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          `}
        >
          <div className="py-8">
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight font-serif">Explore Sri Lanka</h1>
            <p className="text-zinc-500 mt-3 text-lg md:text-xl font-medium">Discover the island's most iconic destinations and hidden gems.</p>
          </div>

          <div className="flex flex-col gap-12">
            {destinationGroups.map((group) => {
              // Hide group if no destinations match
              if (group.destinations.length === 0) return null;

              return (
                <section key={group.title}>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-6 tracking-tight border-b border-zinc-200 pb-2">
                    {group.title}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px]">
                    {group.destinations.map((dest, index) => {
                      const isPrimary = index === 0;
                      return (
                        <div 
                          key={dest.id} 
                          className={`group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 block bg-zinc-900
                            ${isPrimary ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1"}
                          `}
                        >
                          <Image
                            src={dest.image_url}
                            alt={dest.name}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            sizes={isPrimary ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300" />
                          
                          <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end">
                            <h3 className={`${isPrimary ? 'text-3xl' : 'text-2xl'} font-bold text-white mb-2 drop-shadow-md`}>
                              {dest.name}
                            </h3>
                            <div className="inline-block bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-xs font-semibold text-white w-max">
                              {dest.activityCount} Activities
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Map */}
        <div 
          className={`w-full lg:w-[45%] bg-zinc-900 lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] h-[calc(100vh-80px)] rounded-t-2xl lg:rounded-2xl overflow-hidden shadow-2xl
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
