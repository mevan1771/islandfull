import Link from "next/link";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";

const DESTINATIONS = [
  {
    id: 1,
    name: 'Galle',
    activities: 14,
    image: 'https://images.unsplash.com/photo-1546853020-caa2b66255a5?auto=format&fit=crop&w=1200&q=80',
    span: 'col-span-1 md:col-span-2 row-span-2'
  },
  {
    id: 2,
    name: 'Sigiriya',
    activities: 8,
    image: 'https://images.unsplash.com/photo-1588614959060-4d144f28b207?auto=format&fit=crop&w=800&q=80',
    span: 'col-span-1 row-span-2'
  },
  {
    id: 3,
    name: 'Weligama',
    activities: 22,
    image: 'https://images.unsplash.com/photo-1574246604907-827d09618b1d?auto=format&fit=crop&w=800&q=80',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 4,
    name: 'Yala',
    activities: 12,
    image: 'https://images.unsplash.com/photo-1580255977934-03c733621415?auto=format&fit=crop&w=1200&q=80',
    span: 'col-span-1 md:col-span-2 row-span-1'
  },
];

export default function DestinationsPage() {
  return (
    <div className="relative w-full h-[calc(100vh-80px)] mt-[80px] flex overflow-hidden bg-zinc-50">
      
      {/* Left Scrollable Bento Feed - Explicitly prioritized pointer events */}
      <div className="w-full lg:w-[55%] xl:w-[60%] h-full overflow-y-auto px-6 py-8 md:px-12 pointer-events-auto z-20 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900">Explore Sri Lanka</h1>
          <p className="text-zinc-500 mt-2 text-base">Select a destination to filter experiences and live itineraries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[240px] gap-4 pb-24">
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest.id}
              href={`/destinations/${dest.name.toLowerCase()}`}
              className={`relative rounded-3xl overflow-hidden group block shadow-md hover:shadow-2xl transition-all duration-500 pointer-events-auto ${dest.span}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 bg-zinc-900"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between pointer-events-none">
                <div>
                  <h2 className="text-white text-2xl md:text-3xl font-bold drop-shadow-md">{dest.name}</h2>
                  <span className="inline-block mt-2 px-3.5 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-medium">
                    {dest.activities} Activities
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Right Sticky Map Pane - Isolated container bounds */}
      <div className="hidden lg:block lg:w-[45%] xl:w-[40%] h-full relative border-l border-zinc-200 bg-zinc-900 overflow-hidden z-10">
        <div className="absolute inset-0 h-full w-full pointer-events-auto">
          <MapClientWrapper tours={[]} />
        </div>
      </div>

    </div>
  );
}