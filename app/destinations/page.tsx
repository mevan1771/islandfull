"use client"

import { useEffect, useRef, useState } from "react";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";
import type { MapTour } from "@/components/map/InteractiveMap";
import { supabase } from "@/lib/supabase";

type Destination = {
  id: number;
  name: string;
  image: string;
  coordinates: { lat: number; lng: number };
  span: string;
  comingSoon?: boolean;
};

const DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: "Galle",
    image: "https://images.pexels.com/photos/319892/pexels-photo-319892.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.0535, lng: 80.2210 },
    span: "col-span-2 row-span-2 md:col-span-2 md:row-span-2",
  },
  {
    id: 2,
    name: "Sigiriya",
    image: "https://images.pexels.com/photos/35606860/pexels-photo-35606860.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 7.9570, lng: 80.7603 },
    span: "col-span-1 row-span-2 md:col-span-2 md:row-span-1",
  },
  {
    id: 3,
    name: "Kandy",
    image: "https://images.pexels.com/photos/322437/pexels-photo-322437.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 7.2906, lng: 80.6337 },
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    name: "Hikkaduwa",
    image: "https://images.pexels.com/photos/7400676/pexels-photo-7400676.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.1408, lng: 80.1014 },
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    name: "Weligama",
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 5.9735, lng: 80.4297 },
    span: "col-span-1 row-span-1",
  },
  {
    id: 6,
    name: "Yala",
    image: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.3690, lng: 81.5180 },
    span: "col-span-2 row-span-2 md:col-span-2 md:row-span-1",
  },
  {
    id: 7,
    name: "Ella",
    image: "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.8667, lng: 81.0466 },
    span: "col-span-1 row-span-1 md:col-span-1 md:row-span-1",
    comingSoon: true,
  },
  {
    id: 8,
    name: "Mirissa",
    image: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 5.9483, lng: 80.4714 },
    span: "col-span-1 row-span-1",
    comingSoon: true,
  },
  {
    id: 9,
    name: "Colombo",
    image: "https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.9271, lng: 79.8612 },
    span: "col-span-1 row-span-1",
    comingSoon: true,
  },
  {
    id: 10,
    name: "Trincomalee",
    image: "https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 8.5874, lng: 81.2152 },
    span: "col-span-1 row-span-1",
    comingSoon: true,
  },
  {
    id: 11,
    name: "Nuwara Eliya",
    image: "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.9497, lng: 80.7891 },
    span: "col-span-1 row-span-1",
    comingSoon: true,
  },
  {
    id: 12,
    name: "Arugam Bay",
    image: "https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg?auto=compress&cs=tinysrgb&w=800",
    coordinates: { lat: 6.8404, lng: 81.8363 },
    span: "col-span-1 row-span-1",
    comingSoon: true,
  },
];

function toMapTour(activity: any): MapTour {
  let rating = 4.9;
  let reviewCount = 0;
  if (activity.reviews && activity.reviews.length > 0) {
    rating = activity.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / activity.reviews.length;
    reviewCount = activity.reviews.length;
  }

  const tags = Array.isArray(activity.categories)
    ? activity.categories.map((c: any) => c.slug)
    : activity.categories?.slug
      ? [activity.categories.slug]
      : [];

  return {
    id: activity.id,
    title: activity.title,
    slug: activity.slug,
    location: activity.location,
    description: activity.description,
    inclusions: activity.inclusions,
    hostName: activity.provider_name,
    price_usd: activity.price_usd,
    cover_image_url: activity.cover_image_url,
    duration: activity.duration,
    category: activity.categories?.slug || tags[0] || "all",
    category_type: activity.category_type || "tour",
    latitude: activity.approx_lat ? parseFloat(activity.approx_lat) : null,
    longitude: activity.approx_lng ? parseFloat(activity.approx_lng) : null,
    rating: Number(rating.toFixed(1)),
    reviewCount,
    tags,
  };
}

export default function DestinationsPage() {
  const [activeLocation, setActiveLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapTours, setMapTours] = useState<MapTour[]>([]);
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const listScrollRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      try {
        const { data: activities, error } = await supabase
          .from("activities")
          .select("id, title, slug, location, description, inclusions, provider_name, price_usd, cover_image_url, duration, category_type, approx_lat, approx_lng, categories(slug), activity_categories(categories(slug)), reviews(rating)")
          .eq("status", "published")
          .eq("is_paused_by_host", false);

        if (error) {
          console.error("Failed to fetch destination activities:", error);
          return;
        }

        if (cancelled || !activities) return;

        const counts: Record<string, number> = {};
        for (const dest of DESTINATIONS) {
          const key = dest.name.toLowerCase();
          counts[dest.name] = activities.filter((a) =>
            (a.location || "").toLowerCase().includes(key)
          ).length;
        }

        setActivityCounts(counts);
        setMapTours(activities.map(toMapTour));
      } catch (e) {
        console.error("Failed to fetch destination activities:", e);
      }
    }

    loadActivities();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const isMobileMap = mobileView === "map" && window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobileMap) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileView]);

  const showMobileMap = () => {
    listScrollRef.current = window.scrollY;
    setMobileView("map");
  };

  const showMobileList = () => {
    setMobileView("list");
    requestAnimationFrame(() => {
      window.scrollTo({ top: listScrollRef.current, behavior: "auto" });
    });
  };

  return (
    <div className="w-full bg-gray-50">
      <div className="lg:flex lg:items-start lg:max-w-[1600px] lg:mx-auto">
        <section className={`min-w-0 w-full lg:w-[58%] px-4 md:px-8 py-4 md:py-6 pb-24 lg:pb-6 ${mobileView === "map" ? "hidden lg:block" : "block"}`}>
          <div className="mb-4 md:mb-6">
            <h1 className="text-4xl font-bold text-zinc-900">Explore Sri Lanka</h1>
            <p className="text-zinc-500 mt-2 text-base">
              Select a destination to filter experiences and live itineraries.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 grid-flow-row-dense auto-rows-[108px] md:auto-rows-[160px] lg:auto-rows-[180px]">
            {DESTINATIONS.map((dest) => {
              const count = activityCounts[dest.name] ?? 0;
              const isActive = activeLocation?.lat === dest.coordinates.lat && activeLocation?.lng === dest.coordinates.lng;
              const countLabel = dest.comingSoon
                ? "Coming soon"
                : `${count} ${count === 1 ? "Activity" : "Activities"}`;

              return (
                <div
                  key={dest.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    setActiveLocation(dest.coordinates);
                    if (window.matchMedia("(max-width: 1023px)").matches) {
                      showMobileMap();
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveLocation(dest.coordinates);
                    }
                  }}
                  className={`relative h-full min-h-0 rounded-2xl overflow-hidden group cursor-pointer bg-white shadow-sm hover:shadow-md transition-shadow ${dest.span} ${isActive ? "ring-2 ring-rose-500 ring-offset-2 ring-offset-gray-50" : ""}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className={`absolute inset-0 h-full w-full object-cover bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-105 ${dest.comingSoon ? "grayscale-[35%]" : ""}`}
                  />
                  <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10">
                    <h2 className="text-white text-sm md:text-lg font-bold drop-shadow-md leading-tight">{dest.name}</h2>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-white/20 backdrop-blur-md border border-white/30 text-white">
                      {countLabel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside
          className={`${mobileView === "map" ? "fixed inset-0 z-30" : "hidden"} lg:relative lg:inset-auto lg:z-auto lg:block lg:w-[42%] lg:shrink-0 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:mr-6 xl:mr-8 overflow-hidden bg-zinc-900 lg:rounded-2xl lg:shadow-xl lg:border lg:border-zinc-800`}
          data-lenis-prevent
        >
          <div className="absolute inset-0">
            <MapClientWrapper
              tours={mapTours}
              isDestinationMode
              activeLocation={activeLocation}
              resizeToken={mobileView}
            />
          </div>
        </aside>
      </div>

      <button
        type="button"
        onClick={mobileView === "list" ? showMobileMap : showMobileList}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 text-white shadow-xl px-5 py-3 rounded-full flex items-center gap-2 text-sm font-semibold hover:scale-105 transition-all"
      >
        {mobileView === "list" ? "🗺️ Map" : "📋 List"}
      </button>
    </div>
  );
}
