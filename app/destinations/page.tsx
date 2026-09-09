import Link from "next/link";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";

const DESTINATIONS = [
  { 
    id: 1, 
    name: 'Galle', 
    activities: 14, 
    image: 'https://images.unsplash.com/photo-1546853020-caa2b66255a5?auto=format&fit=crop&w=1200&q=80',
    className: 'md:col-span-2 md:row-span-2'
  },
  { 
    id: 2, 
    name: 'Sigiriya', 
    activities: 8, 
    image: 'https://images.unsplash.com/photo-1588614959060-4d144f28b207?auto=format&fit=crop&w=800&q=80',
    className: 'md:col-span-1 md:row-span-2'
  },
  { 
    id: 3, 
    name: 'Weligama', 
    activities: 22, 
    image: 'https://images.unsplash.com/photo-1574246604907-827d09618b1d?auto=format&fit=crop&w=800&q=80',
    className: 'md:col-span-1 md:row-span-1'
  },
  { 
    id: 4, 
    name: 'Yala', 
    activities: 12, 
    image: 'https://images.unsplash.com/photo-1580255977934-03c733621415?auto=format&fit=crop&w=1200&q=80',
    className: 'md:col-span-2 md:row-span-1'
  },
];

export default function DestinationsPage() {
  return (
    <div className="flex w-full h-[calc(100vh-80px)] mt-[80px] overflow-hidden bg-gray-50">

      {/* LEFT PANEL */}
      <div className="w-full lg:w-[60%] h-full overflow-y-auto p-6 md:p-10 [&::-webkit-scrollbar]:hidden">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-zinc-900">Explore Sri Lanka</h1>
          <p className="text-zinc-500 mt-2">Discover the island's most iconic destinations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[220px] pb-20">
          {DESTINATIONS.map((dest) => (
            <Link className={`relative rounded-2xl overflow-hidden group block shadow-md ${dest.className}`} href={`/destinations/${dest.name.toLowerCase()}`} key={dest.id}>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute bottom-5 left-5 z-10">
                <h2 className="text-white text-3xl font-bold drop-shadow-lg">{dest.name}</h2>
                <span className="inline-block mt-3 px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold rounded-full">
                  {dest.activities} Activities
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - Map Integration */}
      <div className="hidden lg:block lg:w-[40%] h-full relative border-l border-zinc-200 bg-zinc-900">
        <MapClientWrapper tours={[]} />
      </div>

    </div>
  );
}