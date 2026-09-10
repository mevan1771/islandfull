import Link from "next/link";
import Image from "next/image";
import { MapClientWrapper } from "@/components/map/MapClientWrapper";

const DESTINATIONS = [
  {
    id: 1,
    name: 'Galle',
    activities: 14,
    image: '/images/destinations/galle.jpg',
    span: 'col-span-1 md:col-span-2 row-span-2'
  },
  {
    id: 2,
    name: 'Sigiriya',
    activities: 8,
    image: '/images/destinations/sigiriya.jpg',
    span: 'col-span-1 row-span-2'
  },
  {
    id: 3,
    name: 'Weligama',
    activities: 22,
    image: '/images/destinations/mirissa.jpg',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 4,
    name: 'Yala',
    activities: 12,
    image: '/images/destinations/yala.jpg',
    span: 'col-span-1 md:col-span-2 row-span-1'
  },
  {
    id: 5,
    name: 'Kandy',
    activities: 18,
    image: '/images/destinations/kandy.jpg',
    span: 'col-span-1 md:col-span-2 row-span-2'
  },
  {
    id: 6,
    name: 'Ella',
    activities: 15,
    image: '/images/destinations/ella.jpg',
    span: 'col-span-1 row-span-1'
  },
  {
    id: 7,
    name: 'Arugam Bay',
    activities: 10,
    image: '/images/destinations/arugam_bay.jpg',
    span: 'col-span-1 row-span-2'
  },
  {
    id: 8,
    name: 'Trincomalee',
    activities: 9,
    image: '/images/destinations/trincomalee.jpg',
    span: 'col-span-1 md:col-span-2 row-span-1'
  },
  {
    id: 9,
    name: 'Nuwara Eliya',
    activities: 7,
    image: '/images/destinations/nuwara_eliya.jpg',
    span: 'col-span-1 row-span-1'
  }
];

export default function DestinationsPage() {
  return (
    <div className="fixed inset-x-0 bottom-0 top-[80px] flex flex-col lg:flex-row overflow-hidden bg-zinc-50 z-30">
      
      {/* Left Scrollable Bento Feed - Fully isolated scroll container */}
      <div className="w-full lg:w-[55%] xl:w-[60%] flex-1 lg:h-full overflow-y-auto px-4 py-6 md:px-12 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="mb-8">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900">Explore Sri Lanka</h1>
          <p className="text-zinc-500 mt-2 text-base">Select a destination to filter experiences and live itineraries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[240px] gap-0 rounded-[2rem] overflow-hidden shadow-xl border-4 border-zinc-900 mb-8 lg:mb-20">
          {DESTINATIONS.map((dest) => (
            <Link
              key={dest.id}
              href={`/destinations/${dest.name.toLowerCase()}`}
              className={`relative overflow-hidden group block transition-all duration-500 ${dest.span} border-[0.5px] border-zinc-800`}
            >
              <Image
                src={dest.image}
                alt={dest.name}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transform transition-transform duration-700 group-hover:scale-105 bg-zinc-900"
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

      {/* Right Sticky Map Pane - Strict boundary lock to prevent scroll leakage */}
      <div className="w-full lg:w-[45%] xl:w-[40%] h-[40vh] lg:h-full relative border-t lg:border-t-0 lg:border-l border-zinc-200 bg-zinc-900 overflow-hidden shrink-0">
        <div className="absolute inset-0 h-full w-full">
          <MapClientWrapper tours={[]} />
        </div>
      </div>

    </div>
  );
}