"use client"

import { useEffect, useRef, useState } from "react";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";
import type { MapTour } from "@/components/map/InteractiveMap";
import { supabase } from "@/lib/supabase";
import { DESTINATIONS, type Destination } from "@/lib/destinations";
import { DestinationBranch } from "@/components/destinations/DestinationBranch";

function toMapTour(activity: any): MapTour {
  let rating = 4.9;
  let reviewCount = 0;
  if (activity.reviews && activity.reviews.length > 0) {
    rating = activity.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / activity.reviews.length;
    reviewCount = activity.reviews.length;
  }

  const primaryTags = Array.isArray(activity.categories)
    ? activity.categories.map((c: any) => c.slug)
    : activity.categories?.slug
      ? [activity.categories.slug]
      : [];
  const junctionTags = Array.isArray(activity.activity_categories)
    ? activity.activity_categories.flatMap((row: any) => {
        const cat = row.categories;
        if (!cat) return [];
        return Array.isArray(cat) ? cat.map((c: any) => c.slug) : [cat.slug];
      }).filter(Boolean)
    : [];
  const tags = [...new Set([...primaryTags, ...junctionTags])];

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
  const [mapCategories, setMapCategories] = useState<{ name: string; slug: string; category_type: string }[]>([]);
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [branchHub, setBranchHub] = useState<Destination | null>(null);
  const [branchTrail, setBranchTrail] = useState<Destination[]>([]);
  const listScrollRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      try {
        const [{ data: activities, error }, { data: categories }] = await Promise.all([
          supabase
            .from("activities")
            .select("id, title, slug, location, description, inclusions, provider_name, price_usd, cover_image_url, duration, category_type, approx_lat, approx_lng, categories(slug), activity_categories(categories(slug)), reviews(rating)")
            .eq("status", "published")
            .eq("is_paused_by_host", false),
          supabase
            .from("categories")
            .select("name, slug, category_type")
            .order("sort_order", { ascending: true })
            .order("name"),
        ]);

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
        setMapCategories(categories || []);
      } catch (e) {
        console.error("Failed to fetch destination activities:", e);
      }
    }

    loadActivities();
    return () => {
      cancelled = true;
    };
  }, []);

  const closeBranch = () => {
    setBranchHub(null);
    setBranchTrail([]);
  };

  const openBranch = (dest: Destination) => {
    setBranchHub(dest);
    setBranchTrail([dest]);
  };

  const branchTo = (dest: Destination) => {
    setBranchHub(dest);
    setBranchTrail((prev) => {
      const existing = prev.findIndex((stop) => stop.id === dest.id);
      if (existing >= 0) return prev.slice(0, existing + 1);
      return [...prev, dest];
    });
  };

  const jumpToTrail = (dest: Destination) => {
    setBranchHub(dest);
    setBranchTrail((prev) => {
      const existing = prev.findIndex((stop) => stop.id === dest.id);
      return existing >= 0 ? prev.slice(0, existing + 1) : [dest];
    });
  };

  const openMapFor = (dest: Destination) => {
    setActiveLocation(dest.coordinates);
    closeBranch();
    if (window.matchMedia("(max-width: 1023px)").matches) {
      showMobileMap();
    }
  };

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

  useEffect(() => {
    const isMobileMap = mobileView === "map" && window.matchMedia("(max-width: 1023px)").matches;
    if (!isMobileMap) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileView]);

  useEffect(() => {
    const onBack = (event: Event) => {
      if (branchHub) {
        event.preventDefault();
        if (branchTrail.length > 1) {
          const nextTrail = branchTrail.slice(0, -1);
          setBranchTrail(nextTrail);
          setBranchHub(nextTrail[nextTrail.length - 1] ?? null);
          return;
        }
        closeBranch();
        return;
      }
      if (mobileView !== "map" || !window.matchMedia("(max-width: 1023px)").matches) return;
      event.preventDefault();
      showMobileList();
    };

    window.addEventListener("islandfull:destinations-back", onBack);
    return () => window.removeEventListener("islandfull:destinations-back", onBack);
  }, [mobileView, branchHub, branchTrail]);

  return (
    <div className="w-full bg-gray-50">
      <div className="lg:flex lg:items-start lg:max-w-[1600px] lg:mx-auto">
        <section className={`min-w-0 w-full lg:w-[58%] px-4 md:px-8 py-3 md:py-6 pb-8 lg:pb-6 ${mobileView === "map" ? "hidden lg:block" : "block"}`}>
          <div className="mb-3 md:mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">Explore Sri Lanka</h1>
            <p className="text-zinc-500 mt-1 md:mt-2 text-sm md:text-base leading-snug">
              Tap a place to see nearby towns branch out, then open the map when you are ready.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 grid-flow-row-dense auto-rows-[108px] md:auto-rows-[160px] lg:auto-rows-[180px]">
            {DESTINATIONS.map((dest) => {
              const count = activityCounts[dest.name] ?? 0;
              const isActive = activeLocation?.lat === dest.coordinates.lat && activeLocation?.lng === dest.coordinates.lng;

              return (
                <div
                  key={dest.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openBranch(dest)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openBranch(dest);
                    }
                  }}
                  aria-label={`${dest.name}${dest.comingSoon ? ", coming soon" : `, ${count} ${count === 1 ? "activity" : "activities"}`}`}
                  className={`relative h-full min-h-0 rounded-2xl overflow-hidden group cursor-pointer bg-white shadow-sm hover:shadow-md transition-shadow ${dest.span}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className={`absolute inset-0 h-full w-full object-cover bg-zinc-900 transition-transform duration-500 ease-out group-hover:scale-105 ${dest.comingSoon ? "grayscale-[35%]" : ""}`}
                  />
                  <div className="hidden md:block absolute inset-x-0 bottom-0 h-24 pointer-events-none bg-gradient-to-t from-black/70 to-transparent" />

                  <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center gap-1.5 min-w-0">
                    <span
                      className={`shrink-0 inline-block uppercase font-bold tracking-wider rounded-full px-2.5 py-1 md:px-3 text-[10px] md:text-xs shadow-sm transition-colors ${
                        isActive
                          ? "bg-rose-500 text-white"
                          : "bg-white/90 text-zinc-900"
                      }`}
                    >
                      {dest.name}
                    </span>
                    {dest.comingSoon ? (
                      <span className="shrink-0 text-[10px] md:text-[11px] font-semibold text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        Soon
                      </span>
                    ) : (
                      <span
                        className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white text-zinc-900 text-[10px] font-bold px-1.5 tabular-nums shadow-sm"
                        aria-hidden
                      >
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {branchHub && (
          <DestinationBranch
            key={branchHub.id}
            hub={branchHub}
            trail={branchTrail}
            counts={activityCounts}
            onClose={closeBranch}
            onBranchTo={branchTo}
            onJumpTo={jumpToTrail}
            onOpenMap={openMapFor}
          />
        )}

        <aside
          className={`${mobileView === "map" ? "max-lg:fixed max-lg:inset-x-0 max-lg:top-16 max-lg:bottom-0 max-lg:z-30 max-lg:block" : "max-lg:hidden"} lg:sticky lg:top-20 lg:block lg:w-[42%] lg:shrink-0 lg:h-[calc(100vh-5rem)] lg:mr-6 xl:mr-8 overflow-hidden bg-zinc-900 lg:rounded-2xl lg:shadow-xl lg:border lg:border-zinc-800`}
          data-lenis-prevent
        >
          <div className="absolute inset-0">
            <MapClientWrapper
              tours={mapTours}
              dynamicCategories={mapCategories}
              isDestinationMode
              activeLocation={activeLocation}
              resizeToken={mobileView}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
