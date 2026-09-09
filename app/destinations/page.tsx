import Link from "next/link";

const DESTINATIONS = [
  { id: 1, name: 'Galle', activities: 14, image: 'https://picsum.photos/seed/galle/800/600' },
  { id: 2, name: 'Sigiriya', activities: 8, image: 'https://picsum.photos/seed/sigiriya/800/600' },
  { id: 3, name: 'Weligama', activities: 22, image: 'https://picsum.photos/seed/weligama/800/600' },
  { id: 4, name: 'Yala', activities: 12, image: 'https://picsum.photos/seed/yala/800/600' },
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {DESTINATIONS.map((dest) => (
            <Link className="relative h-72 rounded-2xl overflow-hidden group block shadow-md" href={`/destinations/${dest.name.toLowerCase()}`} key={dest.id}>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              <div className="absolute bottom-5 left-5 z-10">
                <h2 className="text-white text-3xl font-bold drop-shadow-lg">{dest.name}</h2>
                <span className="inline-block mt-3 px-4 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-sm font-medium">
                  {dest.activities} Activities
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - Placeholder to prevent map crashes */}
      <div className="hidden lg:flex lg:w-[40%] h-full border-l border-zinc-200 bg-zinc-900 items-center justify-center">
        <p className="text-white text-lg">Interactive Map Temporarily Disabled for Debugging</p>
      </div>

    </div>
  );
}