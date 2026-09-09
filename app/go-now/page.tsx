import Link from "next/link";

const LOCATIONS = [
  {
    id: 1,
    name: 'Sigiriya Rock Fortress',
    description: 'The ancient palace in the sky.',
    image: 'https://images.unsplash.com/photo-1588614959060-4d144f28b207?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-2 md:row-span-2'
  },
  {
    id: 2,
    name: 'Nine Arches Bridge',
    description: 'Iconic railway bridge in Ella.',
    image: 'https://images.unsplash.com/photo-1574246604907-827d09618b1d?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-1 md:row-span-1'
  },
  {
    id: 3,
    name: 'Yala National Park',
    description: 'Home to the majestic leopard.',
    image: 'https://images.unsplash.com/photo-1580255977934-03c733621415?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-1 md:row-span-2'
  },
  {
    id: 4,
    name: 'Galle Fort',
    description: 'Dutch colonial history.',
    image: 'https://images.unsplash.com/photo-1546853020-caa2b66255a5?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-2 md:row-span-1'
  },
  {
    id: 5,
    name: 'Mirissa Coast',
    description: 'Whale watching and pristine beaches.',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-1 md:row-span-1'
  },
];

export default function GoNowPage() {
  return (
    <main className="min-h-screen bg-zinc-50 pt-[100px] pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">Go Now</h1>
          <p className="text-zinc-500 mt-3 text-lg max-w-2xl">
            Discover the most breathtaking destinations in Sri Lanka. 
            Pack your bags and experience the magic of the island.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] gap-4">
          {LOCATIONS.map((loc) => (
            <div
              key={loc.id}
              className={`relative rounded-3xl overflow-hidden group shadow-md hover:shadow-xl transition-all duration-500 ${loc.span}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={loc.image}
                alt={loc.name}
                className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105 bg-zinc-900"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-col justify-end pointer-events-none">
                <h2 className="text-white text-2xl md:text-3xl font-bold drop-shadow-md">{loc.name}</h2>
                <p className="text-zinc-200 mt-1 text-sm md:text-base font-medium">{loc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
