import Link from "next/link";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";
import type { MapTour } from "@/components/map/InteractiveMap";
import { supabase } from "@/lib/supabase";

type Destination = {
  id: number;
  name: string;
  image: string;
  comingSoon?: boolean;
};

const DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: "Galle",
    image: "https://images.pexels.com/photos/319892/pexels-photo-319892.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 2,
    name: "Sigiriya",
    image: "https://images.pexels.com/photos/35606860/pexels-photo-35606860.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 3,
    name: "Kandy",
    image: "https://images.pexels.com/photos/322437/pexels-photo-322437.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 4,
    name: "Hikkaduwa",
    image: "https://images.pexels.com/photos/7400676/pexels-photo-7400676.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 5,
    name: "Weligama",
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 6,
    name: "Yala",
    image: "https://images.pexels.com/photos/631317/pexels-photo-631317.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: 7,
    name: "Ella",
    image: "https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=800",
    comingSoon: true,
  },
  {
    id: 8,
    name: "Mirissa",
    image: "https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800",
    comingSoon: true,
  },
  {
    id: 9,
    name: "Colombo",
    image: "https://images.pexels.com/photos/1549326/pexels-photo-1549326.jpeg?auto=compress&cs=tinysrgb&w=800",
    comingSoon: true,
  },
  {
    id: 10,
    name: "Trincomalee",
    image: "https://images.pexels.com/photos/1078983/pexels-photo-1078983.jpeg?auto=compress&cs=tinysrgb&w=800",
    comingSoon: true,
  },
  {
    id: 11,
    name: "Nuwara Eliya",
    image: "https://images.pexels.com/photos/1591373/pexels-photo-1591373.jpeg?auto=compress&cs=tinysrgb&w=800",
    comingSoon: true,
  },
  {
    id: 12,
    name: "Arugam Bay",
    image: "https://images.pexels.com/photos/390051/surfer-wave-sunset-the-indian-ocean-390051.jpeg?auto=compress&cs=tinysrgb&w=800",
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

export default async function DestinationsPage() {
  let mapTours: MapTour[] = [];
  const activityCounts: Record<string, number> = {};

  try {
    const { data: activities, error } = await supabase
      .from("activities")
      .select("id, title, slug, location, description, inclusions, provider_name, price_usd, cover_image_url, duration, category_type, approx_lat, approx_lng, categories(slug), activity_categories(categories(slug)), reviews(rating)")
      .eq("status", "published")
      .eq("is_paused_by_host", false);

    if (error) {
      console.error("Failed to fetch destination activities:", error);
    }

    if (activities) {
      for (const dest of DESTINATIONS) {
        const key = dest.name.toLowerCase();
        activityCounts[dest.name] = activities.filter((a) =>
          (a.location || "").toLowerCase().includes(key)
        ).length;
      }

      mapTours = activities.map(toMapTour);
    }
  } catch (e) {
    console.error("Failed to fetch destination activities:", e);
  }

  return (
    <div className="w-full bg-zinc-50">
      <div className="mx-auto w-full max-w-[1600px] px-4 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(340px,42vw)] xl:grid-cols-[minmax(0,1fr)_520px] gap-6 lg:gap-8 items-start">
          <section className="min-w-0">
            <div className="mb-8">
              <h1 className="text-4xl font-black tracking-tight text-zinc-900">Explore Sri Lanka</h1>
              <p className="text-zinc-500 mt-2 text-base">
                Select a destination to filter experiences and live itineraries.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {DESTINATIONS.map((dest) => {
                const count = activityCounts[dest.name] ?? 0;
                const label = dest.comingSoon
                  ? "Coming soon"
                  : `${count} ${count === 1 ? "Activity" : "Activities"}`;

                const cardClassName = "relative block aspect-[4/3] overflow-hidden rounded-3xl shadow-md bg-zinc-900";

                const content = (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className={`absolute inset-0 h-full w-full object-cover bg-zinc-900 ${dest.comingSoon ? "grayscale-[35%] scale-100" : "transform transition-transform duration-700 group-hover:scale-105"}`}
                    />
                    <div className={`absolute inset-0 pointer-events-none ${dest.comingSoon ? "bg-gradient-to-t from-black/85 via-black/40 to-black/10" : "bg-gradient-to-t from-black/80 via-black/20 to-transparent"}`} />

                    <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
                      <h2 className="text-white text-lg md:text-2xl font-bold drop-shadow-md">{dest.name}</h2>
                      <span className={`inline-block mt-2 px-3 py-1 backdrop-blur-md border rounded-full text-xs font-medium ${dest.comingSoon ? "bg-white/10 border-white/20 text-white/80" : "bg-white/20 border-white/30 text-white"}`}>
                        {label}
                      </span>
                    </div>
                  </>
                );

                if (dest.comingSoon) {
                  return (
                    <div key={dest.id} className={`${cardClassName} cursor-default`}>
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    key={dest.id}
                    href={`/?location=${encodeURIComponent(dest.name)}`}
                    className={`${cardClassName} transition-all duration-500 group hover:shadow-2xl hover:-translate-y-0.5`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>

          <aside className="relative isolate w-full h-[280px] lg:h-[calc(100vh-7rem)] lg:sticky lg:top-24 overflow-hidden rounded-3xl shadow-2xl border-4 border-zinc-900 bg-zinc-900" data-lenis-prevent>
            <div className="absolute inset-0">
              <MapClientWrapper tours={mapTours} isDestinationMode />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
