"use client"

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";
import type { MapTour } from "@/components/map/InteractiveMap";
import { supabase } from "@/lib/supabase";
import { DESTINATIONS, activityBelongsToDestination, getNearbyDestinations, type Destination } from "@/lib/destinations";
import { getDestinationGuide } from "@/lib/destinationGuides";
import { formatUSD } from "@/lib/utils";

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
  const [activeLocation, setActiveLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [mapTours, setMapTours] = useState<MapTour[]>([]);
  const [mapCategories, setMapCategories] = useState<{ name: string; slug: string; category_type: string }[]>([]);
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const [branchHub, setBranchHub] = useState<Destination | null>(null);
  const listScrollRef = useRef(0);
  const mosaicScrollRef = useRef(0);

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
          counts[dest.name] = activities.filter((a) => {
            const lat = a.approx_lat ? parseFloat(a.approx_lat) : null
            const lng = a.approx_lng ? parseFloat(a.approx_lng) : null
            const coords = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng)
              ? { lat, lng }
              : null
            return activityBelongsToDestination(dest, a.location || "", coords)
          }).length
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
    requestAnimationFrame(() => {
      window.scrollTo({ top: mosaicScrollRef.current, behavior: "auto" });
    });
  };

  const selectHub = (dest: Destination) => {
    if (!branchHub) mosaicScrollRef.current = window.scrollY;
    setBranchHub(dest);
    setActiveLocation({ ...dest.coordinates, zoom: 9.2 });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
  };

  const openMapFor = (dest: Destination) => {
    setActiveLocation({ ...dest.coordinates, zoom: 9.2 });
    if (window.matchMedia("(max-width: 1023px)").matches) {
      showMobileMap();
    }
  };

  const focusTour = (tour: MapTour) => {
    if (tour.latitude != null && tour.longitude != null) {
      setActiveLocation({ lat: tour.latitude, lng: tour.longitude, zoom: 12.4 });
    }
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
        closeBranch();
        return;
      }
      if (mobileView !== "map" || !window.matchMedia("(max-width: 1023px)").matches) return;
      event.preventDefault();
      showMobileList();
    };

    window.addEventListener("islandfull:destinations-back", onBack);
    return () => window.removeEventListener("islandfull:destinations-back", onBack);
  }, [mobileView, branchHub]);

  return (
    <div className="w-full bg-gray-50">
      <div className="lg:flex lg:items-start lg:max-w-[1600px] lg:mx-auto">
        <section className={`min-w-0 w-full lg:w-[58%] px-4 md:px-8 py-3 md:py-6 pb-8 lg:pb-6 ${mobileView === "map" ? "hidden lg:block" : "block"}`}>
          {branchHub ? (
            <DestinationPage
              dest={branchHub}
              tours={mapTours}
              onClose={closeBranch}
              onSelectNearby={selectHub}
              onOpenMap={() => openMapFor(branchHub)}
              onFocusTour={focusTour}
            />
          ) : (
            <>
              <div className="mb-3 md:mb-6">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">Explore Sri Lanka</h1>
                <p className="text-zinc-500 mt-1 md:mt-2 text-sm md:text-base leading-snug">
                  Tap a destination to see nearby towns, then open the map.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 grid-flow-row-dense auto-rows-[108px] md:auto-rows-[160px] lg:auto-rows-[180px]">
                {DESTINATIONS.map((dest) => {
                  const count = activityCounts[dest.name] ?? 0
                  const isMapActive = activeLocation?.lat === dest.coordinates.lat && activeLocation?.lng === dest.coordinates.lng

                  return (
                    <div
                      key={dest.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectHub(dest)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          selectHub(dest)
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
                          className={`shrink-0 inline-block uppercase font-bold tracking-wider rounded-full px-2.5 py-1 md:px-3 text-[10px] md:text-xs shadow-sm ${
                            isMapActive ? "bg-rose-500 text-white" : "bg-white/90 text-zinc-900"
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
                  )
                })}
              </div>
            </>
          )}
        </section>

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

function Label({ children }: { children: string }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold">{children}</p>
  )
}

function activitiesForDestination(tours: MapTour[], dest: Destination) {
  return tours.filter((tour) => {
    const coords =
      tour.latitude != null && tour.longitude != null
        ? { lat: tour.latitude, lng: tour.longitude }
        : null
    return activityBelongsToDestination(dest, tour.location || "", coords)
  })
}

function DestinationPage({
  dest,
  tours,
  onClose,
  onSelectNearby,
  onOpenMap,
  onFocusTour,
}: {
  dest: Destination
  tours: MapTour[]
  onClose: () => void
  onSelectNearby: (dest: Destination) => void
  onOpenMap: () => void
  onFocusTour: (tour: MapTour) => void
}) {
  const guide = getDestinationGuide(dest.name)
  const nearby = getNearbyDestinations(dest.name)
  const local = activitiesForDestination(tours, dest)
  const groups = {
    tour: local.filter((item) => (item.category_type || "tour") === "tour"),
    event: local.filter((item) => item.category_type === "event"),
    transport: local.filter((item) => item.category_type === "transport"),
  }
  const tabs = (
    [
      { id: "tour" as const, label: "Tours", items: groups.tour },
      { id: "event" as const, label: "Events", items: groups.event },
      { id: "transport" as const, label: "Transport", items: groups.transport },
    ]
  ).filter((tab) => tab.items.length > 0)
  const [activeTab, setActiveTab] = useState<"tour" | "event" | "transport">("tour")

  useEffect(() => {
    const first = (
      [
        { id: "tour" as const, count: groups.tour.length },
        { id: "event" as const, count: groups.event.length },
        { id: "transport" as const, count: groups.transport.length },
      ]
    ).find((tab) => tab.count > 0)
    setActiveTab(first?.id ?? "tour")
  }, [dest.id, groups.tour.length, groups.event.length, groups.transport.length])
  const visible = tabs.find((tab) => tab.id === activeTab)?.items ?? tabs[0]?.items ?? []

  return (
    <article>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-start">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-200 aspect-[4/3]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={dest.image} alt={dest.name} className="absolute inset-0 h-full w-full object-cover object-center" />
        </div>

        <div className="min-w-0 sm:pt-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Label>{guide?.region ?? "Destination"}</Label>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-zinc-900 leading-tight">
                {dest.name}
              </h1>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-full bg-zinc-900 text-white text-sm font-semibold px-3 py-1.5 hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
          {guide && (
            <>
              <p className="text-zinc-500 mt-1 md:mt-2 text-sm md:text-base leading-snug">{guide.tagline}</p>
              <p className="mt-4 text-[15px] md:text-base text-zinc-600 leading-relaxed">{guide.famousFor}</p>
              <p className="mt-3 text-sm text-zinc-500">
                Best {guide.season}
                <span className="mx-2 text-zinc-300">·</span>
                {guide.bestFor.join(" · ")}
              </p>
            </>
          )}
        </div>
      </div>

      {tabs.length > 0 && (
        <div className="mt-8">
          <div className="grid grid-cols-3 gap-1 p-1 rounded-full bg-zinc-100">
            {(["tour", "event", "transport"] as const).map((id) => {
              const tab = tabs.find((item) => item.id === id)
              const count = tab?.items.length ?? 0
              const label = id === "tour" ? "Tours" : id === "event" ? "Events" : "Transport"
              const enabled = count > 0
              const active = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  disabled={!enabled}
                  onClick={() => enabled && setActiveTab(id)}
                  className={`rounded-full py-2 text-xs md:text-sm font-semibold transition-colors ${
                    active && enabled
                      ? "bg-white text-zinc-900 shadow-sm"
                      : enabled
                        ? "text-zinc-500 hover:text-zinc-800"
                        : "text-zinc-300"
                  }`}
                >
                  {label}
                  {enabled ? ` · ${count}` : ""}
                </button>
              )
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 md:gap-4">
            {visible.map((tour) => {
              const location = (tour.location || "").replace(", Sri Lanka", "")
              return (
                <div key={tour.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => onFocusTour(tour)}
                    className="relative w-full overflow-hidden rounded-2xl md:rounded-3xl bg-zinc-100 aspect-square group text-left shadow-sm hover:shadow-md transition-shadow"
                    aria-label={`Show ${tour.title} on the map`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tour.cover_image_url || dest.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </button>
                  <div className="mt-2 px-0.5">
                    {tour.slug ? (
                      <Link
                        href={`/activity/${tour.slug}`}
                        className="block text-sm md:text-base font-semibold text-zinc-900 leading-tight line-clamp-2 hover:text-rose-500"
                      >
                        {tour.title}
                      </Link>
                    ) : (
                      <p className="text-sm md:text-base font-semibold text-zinc-900 leading-tight line-clamp-2">
                        {tour.title}
                      </p>
                    )}
                    {location && (
                      <p className="mt-1 text-xs sm:text-sm text-zinc-500 truncate">{location}</p>
                    )}
                    <p className="mt-1 text-sm text-zinc-900">
                      <span className="font-bold">{formatUSD(tour.price_usd)}</span>
                      {tour.duration ? (
                        <span className="font-normal text-zinc-500"> · {tour.duration}</span>
                      ) : null}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {guide && (
        <>
          <div className="mt-8">
            <Label>Things to see</Label>
            <ul className="mt-3 space-y-3">
              {guide.see.map((item) => (
                <li key={item.title}>
                  <p className="text-sm md:text-[15px] font-semibold text-zinc-900">{item.title}</p>
                  <p className="text-sm text-zinc-500 leading-snug">{item.note}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-7">
            <Label>Eat & drink</Label>
            <p className="mt-2 text-sm md:text-[15px] text-zinc-700 leading-relaxed">{guide.eat.join("  ·  ")}</p>
          </div>

          <div className="mt-7">
            <Label>Good to know</Label>
            <ul className="mt-2 space-y-1.5">
              {guide.tips.map((tip) => (
                <li key={tip} className="text-sm text-zinc-500 leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {nearby.length > 0 && (
        <div className="mt-8">
          <Label>{`Nearby from ${dest.name}`}</Label>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {nearby.map((row, index) => (
              <button
                key={row.dest.id}
                type="button"
                onClick={() => onSelectNearby(row.dest)}
                style={{ animationDelay: `${index * 50}ms` }}
                className="destination-mosaic-pop shrink-0 w-[7.5rem] text-left"
                aria-label={`Nearby ${row.dest.name}, ${row.note}`}
              >
                <span className="relative block h-20 w-[7.5rem] overflow-hidden rounded-2xl bg-zinc-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={row.dest.image} alt="" className="h-full w-full object-cover object-center" />
                </span>
                <span className="mt-1.5 block text-xs font-bold text-zinc-900 truncate">{row.dest.name}</span>
                <span className="block text-[10px] text-zinc-500">{row.note}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onOpenMap}
        className="mt-6 w-full rounded-full bg-rose-500 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600"
      >
        {local.length > 0 ? `See all on the map · ${local.length}` : `Open map · ${dest.name}`}
      </button>
    </article>
  )
}
