"use client"

import { useEffect, useRef, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";
import type { MapTour } from "@/components/map/InteractiveMap";
import { supabase } from "@/lib/supabase";
import {
  DESTINATIONS,
  activityBelongsToDestination,
  destinationFromSlug,
  destinationSlug,
  getNearbyDestinations,
  type Destination,
} from "@/lib/destinations";
import { getDestinationGuide } from "@/lib/destinationGuides";
import { formatUSD } from "@/lib/utils";
import { SortBySelect } from "@/components/ui/SortBySelect";
import { sortTours, type TourSort } from "@/lib/tour-sort";

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
    created_at: activity.created_at,
    popularity_score: activity.popularity_score ?? 0,
  };
}

export default function DestinationsRoute() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-gray-50" />}>
      <DestinationsPage />
    </Suspense>
  )
}

function DestinationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const branchHub = destinationFromSlug(searchParams.get("dest"))
  const [activeLocation, setActiveLocation] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [mapTours, setMapTours] = useState<MapTour[]>([]);
  const [mapCategories, setMapCategories] = useState<{ name: string; slug: string; category_type: string }[]>([]);
  const [activityCounts, setActivityCounts] = useState<Record<string, number>>({});
  const [mobileView, setMobileView] = useState<"list" | "map">("list");
  const listScrollRef = useRef(0);
  const mosaicScrollRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function loadActivities() {
      try {
        const activitySelect =
          "id, title, slug, location, description, inclusions, provider_name, price_usd, cover_image_url, duration, category_type, approx_lat, approx_lng, created_at, popularity_score, categories(slug), activity_categories(categories(slug)), reviews(rating)"
        const activitySelectFallback =
          "id, title, slug, location, description, inclusions, provider_name, price_usd, cover_image_url, duration, category_type, approx_lat, approx_lng, created_at, categories(slug), activity_categories(categories(slug)), reviews(rating)"

        let activitiesRes = await supabase
          .from("activities")
          .select(activitySelect)
          .eq("status", "published")
          .eq("is_paused_by_host", false)
          .order("popularity_score", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })

        if (activitiesRes.error && String(activitiesRes.error.message || "").includes("popularity_score")) {
          activitiesRes = await supabase
            .from("activities")
            .select(activitySelectFallback)
            .eq("status", "published")
            .eq("is_paused_by_host", false)
            .order("created_at", { ascending: false }) as typeof activitiesRes
        }

        const [{ data: categories }] = await Promise.all([
          supabase
            .from("categories")
            .select("name, slug, category_type")
            .order("sort_order", { ascending: true })
            .order("name"),
        ])

        const { data: activities, error } = activitiesRes

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
            return a.category_type !== "place" && activityBelongsToDestination(dest, a.location || "", coords)
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
    setMobileView("list");
    router.replace("/destinations");
    requestAnimationFrame(() => {
      window.scrollTo({ top: mosaicScrollRef.current, behavior: "auto" });
    });
  };

  const selectHub = (dest: Destination) => {
    if (!branchHub) mosaicScrollRef.current = window.scrollY;
    router.push(`/destinations?dest=${destinationSlug(dest.name)}`);
  };

  useEffect(() => {
    if (branchHub) {
      sessionStorage.setItem("islandfull:return-dest", destinationSlug(branchHub.name))
      setActiveLocation({ ...branchHub.coordinates, zoom: 9.2 })
      window.scrollTo({ top: 0, behavior: "auto" })
      return
    }
    sessionStorage.removeItem("islandfull:return-dest")
  }, [branchHub])

  const openMapFor = (dest: Destination) => {
    setActiveLocation({ ...dest.coordinates, zoom: 12 });
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
      if (mobileView === "map" && window.matchMedia("(max-width: 1023px)").matches) {
        event.preventDefault();
        showMobileList();
        return;
      }
      if (branchHub) {
        event.preventDefault();
        closeBranch();
        return;
      }
      event.preventDefault();
      router.push("/");
    };

    window.addEventListener("islandfull:destinations-back", onBack);
    return () => window.removeEventListener("islandfull:destinations-back", onBack);
  }, [mobileView, branchHub, router]);

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
            />
          ) : (
            <>
              <div className="mb-3 md:mb-6">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">Explore Sri Lanka</h1>
                <p className="text-zinc-500 mt-1 md:mt-2 text-sm md:text-base leading-snug">
                  Tap a destination to see nearby towns, then open the map.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-2 gap-y-3 md:gap-x-3 md:gap-y-4 grid-flow-row-dense auto-rows-[152px] md:auto-rows-[204px] lg:auto-rows-[226px]">
                {DESTINATIONS.map((dest) => {
                  const count = activityCounts[dest.name] ?? 0
                  const isMapActive = activeLocation?.lat === dest.coordinates.lat && activeLocation?.lng === dest.coordinates.lng
                  const guide = getDestinationGuide(dest.name)

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
                      className={`flex flex-col min-h-0 cursor-pointer group ${dest.span}`}
                    >
                      <div className="relative flex-1 min-h-0 overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
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
                      {guide ? (
                        <div className="mt-1.5 px-0.5 min-w-0">
                          <p className="text-[11px] md:text-xs font-medium text-zinc-800 truncate">{guide.region}</p>
                          <p className="text-[11px] text-zinc-500 leading-snug line-clamp-2">{guide.tagline}</p>
                        </div>
                      ) : dest.comingSoon ? (
                        <p className="mt-1.5 px-0.5 text-[11px] text-zinc-500">Listing soon</p>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </section>

        <aside
          className={`${mobileView === "map" ? "max-lg:fixed max-lg:inset-x-0 max-lg:top-16 max-lg:bottom-0 max-lg:h-[calc(100dvh-4rem)] max-lg:z-30 max-lg:block" : "max-lg:hidden"} relative lg:sticky lg:top-20 lg:block lg:w-[42%] lg:shrink-0 lg:h-[calc(100dvh-5rem)] lg:mr-6 xl:mr-8 overflow-hidden bg-zinc-900 lg:rounded-2xl lg:shadow-xl lg:border lg:border-zinc-800`}
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
}: {
  dest: Destination
  tours: MapTour[]
  onClose: () => void
  onSelectNearby: (dest: Destination) => void
  onOpenMap: () => void
}) {
  const guide = getDestinationGuide(dest.name)
  const nearby = getNearbyDestinations(dest.name)
  const local = activitiesForDestination(tours, dest)
  const groups = {
    tour: local.filter((item) => (item.category_type || "tour") === "tour"),
    event: local.filter((item) => item.category_type === "event"),
    transport: local.filter((item) => item.category_type === "transport"),
  }
  const places = local.filter((item) => item.category_type === "place")
  const tabs = (
    [
      { id: "tour" as const, label: "Tours", items: groups.tour },
      { id: "event" as const, label: "Events", items: groups.event },
      { id: "transport" as const, label: "Transport", items: groups.transport },
    ]
  ).filter((tab) => tab.items.length > 0)
  const [activeTab, setActiveTab] = useState<"tour" | "event" | "transport">("tour")
  const [sort, setSort] = useState<TourSort>("recommended")

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
  const visible = sortTours(
    tabs.find((tab) => tab.id === activeTab)?.items ?? tabs[0]?.items ?? [],
    sort
  )

  return (
    <article>
      <div className="sm:hidden">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={dest.image}
            alt=""
            className="h-[76px] w-[76px] rounded-2xl object-cover shrink-0 bg-zinc-200"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <Label>{guide?.region ?? "Destination"}</Label>
                <h1 className="text-[28px] font-bold text-zinc-900 leading-tight">{dest.name}</h1>
              </div>
              <button
                type="button"
                onClick={onOpenMap}
                className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-rose-500 text-white text-sm font-bold pl-2.5 pr-3 py-1.5 shadow-lg shadow-rose-500/20 hover:bg-rose-600"
              >
                <MapPin className="w-3.5 h-3.5" />
                Map
              </button>
            </div>
            {guide ? (
              <p className="text-zinc-500 mt-1 text-sm leading-snug">{guide.tagline}</p>
            ) : null}
          </div>
        </div>
        {guide ? (
          <>
            <p className="mt-4 text-sm text-zinc-600 leading-relaxed">{guide.famousFor}</p>
            <p className="mt-3 text-sm text-zinc-500">
              Best {guide.season}
              <span className="mx-2 text-zinc-300">·</span>
              {guide.bestFor.join(" · ")}
            </p>
          </>
        ) : null}
      </div>

      <div className="hidden sm:grid grid-cols-2 gap-4 md:gap-6 items-start">
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
              <p className="mt-4 text-sm text-zinc-600 leading-relaxed">{guide.famousFor}</p>
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
        <div className="mt-6 lg:mt-8">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1 grid grid-cols-3 gap-0.5 p-1 rounded-full bg-zinc-100">
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
                  className={`rounded-full py-2 text-[11px] md:text-sm font-semibold transition-colors ${
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
            <SortBySelect variant="icon" value={sort} onChange={setSort} />
          </div>

          <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-2.5 md:gap-3">
            {visible.map((tour) => {
              const location = (tour.location || "").replace(", Sri Lanka", "")
              const body = (
                <>
                  <span className="relative block w-full overflow-hidden rounded-xl md:rounded-2xl bg-zinc-100 aspect-[4/3] shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tour.cover_image_url || dest.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </span>
                  <span className="mt-1.5 px-0.5 block">
                    <span className="block text-[13px] md:text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-rose-500">
                      {tour.title}
                    </span>
                    {location ? (
                      <span className="mt-0.5 block text-[11px] text-zinc-500 truncate">{location}</span>
                    ) : null}
                    <span className="mt-0.5 block text-[13px] text-zinc-900">
                      <span className="font-bold">{formatUSD(tour.price_usd)}</span>
                      {tour.duration ? (
                        <span className="font-normal text-zinc-500"> · {tour.duration}</span>
                      ) : null}
                    </span>
                  </span>
                </>
              )
              return tour.slug ? (
                <Link key={tour.id} href={`/activity/${tour.slug}`} className="min-w-0 group">
                  {body}
                </Link>
              ) : (
                <div key={tour.id} className="min-w-0">
                  {body}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {places.length > 0 ? (
        <div className="mt-8">
          <Label>Things to see</Label>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {places.map((place) => (
              <Link key={place.id} href={`/activity/${place.slug}`} className="group">
                <span className="relative block w-full aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={place.cover_image_url || "/placeholder.jpg"}
                    alt={place.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2 left-2 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-800">
                    Must see
                  </span>
                </span>
                <p className="mt-1.5 text-[13px] md:text-sm font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-rose-500">
                  {place.title}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">
                  {(place.location || "").replace(", Sri Lanka", "")}
                  {place.duration ? ` · ${place.duration}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </div>
      ) : guide ? (
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
      ) : null}

      {guide && (
        <>
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
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
            {nearby.map((row, index) => (
              <button
                key={row.dest.id}
                type="button"
                onClick={() => onSelectNearby(row.dest)}
                style={{ animationDelay: `${index * 50}ms` }}
                className="destination-mosaic-pop shrink-0 w-40 md:w-44 text-left"
                aria-label={`Nearby ${row.dest.name}, ${row.note}`}
              >
                <span className="relative block w-full aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={row.dest.image} alt="" className="h-full w-full object-cover object-center" />
                </span>
                <span className="mt-2 block text-sm font-bold text-zinc-900 truncate">{row.dest.name}</span>
                <span className="block text-xs text-zinc-500">{row.note}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
