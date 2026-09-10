import Link from "next/link";
import Image from "next/image";

const LOCATIONS = [
  {
    id: 1,
    name: 'Sigiriya Rock Fortress',
    description: 'The ancient palace in the sky.',
    image: '/images/destinations/sigiriya.jpg',
    span: 'md:col-span-2 md:row-span-2'
  },
  {
    id: 2,
    name: 'Nine Arches Bridge',
    description: 'Iconic railway bridge in Ella.',
    image: '/images/destinations/nine_arches.jpg',
    span: 'md:col-span-1 md:row-span-1'
  },
  {
    id: 3,
    name: 'Yala National Park',
    description: 'Home to the majestic leopard.',
    image: '/images/destinations/yala.jpg',
    span: 'md:col-span-1 md:row-span-2'
  },
  {
    id: 4,
    name: 'Galle Fort',
    description: 'Dutch colonial history.',
    image: '/images/destinations/galle.jpg',
    span: 'md:col-span-2 md:row-span-1'
  },
  {
    id: 5,
    name: 'Mirissa Coast',
    description: 'Whale watching and pristine beaches.',
    image: '/images/destinations/mirissa.jpg',
    span: 'md:col-span-1 md:row-span-1'
  },
];

export default function GoNowPage() {
  return (
    <main className="min-h-screen bg-zinc-100 pt-[120px] pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-zinc-900">Go Now</h1>
          <p className="text-zinc-600 mt-4 text-xl max-w-2xl font-medium">
            Discover the most breathtaking destinations in Sri Lanka. 
            Pack your bags and experience the magic of the island.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[320px] gap-6">
          {LOCATIONS.map((loc) => (
            <div
              key={loc.id}
              className={`relative rounded-[2rem] overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-700 ${loc.span}`}
            >
              <Image
                src={loc.image}
                alt={loc.name}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transform transition-transform duration-[1.5s] group-hover:scale-110 bg-zinc-900"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none opacity-90 transition-opacity duration-700 group-hover:opacity-100" />

              <div className="absolute bottom-8 left-8 right-8 z-10 flex flex-col justify-end pointer-events-none transform transition-transform duration-700 translate-y-2 group-hover:translate-y-0">
                <h2 className="text-white text-3xl md:text-4xl font-bold tracking-tight drop-shadow-xl">{loc.name}</h2>
                <p className="text-zinc-200 mt-2 text-base md:text-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">{loc.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
