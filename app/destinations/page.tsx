"use client";

import { useState } from "react";
import { destinations } from "@/lib/data/destinations";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";
import type { MapTour } from "@/components/map/InteractiveMap";
import { Map, List } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DestinationsPage() {
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

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
      destinations: destinations.filter((d) => ["galle", "weligama"].includes(d.id)),
    },
    {
      title: "Cultural Triangle",
      destinations: destinations.filter((d) => ["sigiriya", "kandy"].includes(d.id)),
    },
    {
      title: "Highlands & Wild",
      destinations: destinations.filter((d) => ["ella", "yala"].includes(d.id)),
    },
  ];

  return (
    // 1. Root wrapper: fixed height, overflow hidden, placed below navbar
    <div className="flex w-full h-[calc(100vh-80px)] mt-[80px] overflow-hidden bg-gray-50">

      {/* 2. Left Panel: flex-1, overflow-y-auto, relative, z-10 */}
      <div
        className={`h-full overflow-y-auto relative z-10 p-4 md:p-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
          ${viewMode === "map" ? "hidden lg:flex flex-col flex-1" : "flex flex-col flex-1"}
        `}
      >
        {/* Header */}
        <div className="pb-6">
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">Explore Sri Lanka</h1>
          <p className="text-zinc-500 mt-2 text-base md:text-lg">Discover the island&apos;s most iconic destinations and hidden gems.</p>
        </div>

        {/* Bento Grid Groups */}
        <div className="flex flex-col gap-10 pb-20">
          {destinationGroups.map((group) => {
            if (group.destinations.length === 0) return null;
            return (
              <section key={group.title}>
                <h2 className="text-xl font-bold text-zinc-800 mb-4 tracking-tight border-b border-zinc-200 pb-2">
                  {group.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
                  {group.destinations.map((dest, index) => {
                    const isPrimary = index === 0;
                    return (
                      <Link
                        key={dest.id}
                        href={`/destinations/${dest.id}`}
                        className={`group relative rounded-2xl overflow-hidden bg-zinc-900 shadow-sm hover:shadow-xl transition-all duration-500 pointer-events-auto z-20
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 w-full p-5 pointer-events-none">
                          <h3 className={`${isPrimary ? "text-3xl" : "text-xl"} font-bold text-white mb-2 drop-shadow-md`}>
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
              </section>
            );
          })}
        </div>
      </div>

      {/* 3. Right Map Panel: strict width, relative, z-0 */}
      <div
        className={`h-full relative z-0
          ${viewMode === "map" ? "flex-1 lg:flex-none lg:w-[45%] block" : "hidden lg:block lg:w-[45%]"}
        `}
      >
        <MapClientWrapper tours={mapData} isDestinationMode={true} />
      </div>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 text-white shadow-xl px-6 py-3 rounded-full flex items-center gap-2 text-sm font-semibold hover:scale-105 transition-all active:scale-95"
      >
        {viewMode === "list" ? (
          <><Map className="w-4 h-4" /> Map</>
        ) : (
          <><List className="w-4 h-4" /> List</>
        )}
      </button>
    </div>
  );
}
