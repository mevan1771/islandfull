import Link from "next/link";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";

const DESTINATIONS = [
  {
    id: 1,
    name: 'Galle',
    activities: 14,
    image: '[https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80](https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1200&q=80)',
    span: 'col-span-1 md:col-span-2 row-span-2'
  },
  {
    id: 2,
    name: 'Sigiriya',
    activities: 8,
    image: '[https://images.unsplash.com/photo-1586724237569-f3d0c1ebd4e2?auto=format&fit=crop&w=800&q=80](https://images.unsplash.com/photo-1586724237569-f3d0c1ebd4e2?auto=format&fit=crop&w=800&q=80)',
    span: 'col-span-1 row-span-2'
  },
  {
    id: 3,
    name: 'Weligama',
    activities: 22,
    image: '[https://images.unsplash.com/photo-1574246604907-827d09618b1d?auto=format&fit=crop&w=800&q=80](https://images.unsplash.com/photo-1574246604907-827d09618b1d?auto=format&fit=crop&w=800&q=80)',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 4,
    name: 'Yala',
    activities: 12,
    image: '[https://images.unsplash.com/photo-1580255977934-03c733621415?auto=format&fit=crop&w=1200&q=80](https://images.unsplash.com/photo-1580255977934-03c733621415?auto=format&fit=crop&w=1200&q=80)',
    span: 'col-span-1 md:col-span-2 row-span-1'
  },
];

export default function DestinationsPage() {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[80px] flex overflow-hidden bg-zinc-50 z-30">
      
      {/* LEFT PANEL */}
      <div className="w-full lg:w-[55%] xl:w-[60%] h-full overflow-y-auto px-6 py-8 md:px-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900">Explore Sri Lanka</h1>
          <p className="text-zinc-500 mt-2 text-base">Select a destination to filter experiences and live itineraries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[240px] gap-4 pb-20">
          {DESTINATIONS.map((dest) => (
            <Link ${dest.span}`} block className="{`relative" duration-500 group hover:shadow-2xl href="{`/destinations/${dest.name.toLowerCase()}`}" key="{dest.id}" overflow-hidden rounded-3xl shadow-md transition-all>
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

      {/* RIGHT PANEL */}
      <div className="hidden lg:block lg:w-[45%] xl:w-[40%] h-full relative border-l border-zinc-200 bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 h-full w-full">
          <MapClientWrapper tours="{[]}"/>
        </div>
      </div>

    </div>
  );
}
