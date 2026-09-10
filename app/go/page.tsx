import Link from "next/link";
import Image from "next/image";

const LOCATIONS = [
  {
    id: 1,
    name: 'Sigiriya Rock Fortress',
    description: 'The ancient palace in the sky.',
    image: 'https://images.unsplash.com/photo-1588598198321-97368d4076e6?auto=format&fit=crop&q=80&w=1280',
    span: 'md:col-span-2 md:row-span-2'
  },
  {
    id: 2,
    name: 'Nine Arches Bridge',
    description: 'Iconic railway bridge in Ella.',
    image: 'https://images.unsplash.com/photo-1546708773-51780f2d80d2?auto=format&fit=crop&q=80&w=1280',
    span: 'md:col-span-1 md:row-span-1'
  },
  {
    id: 3,
    name: 'Yala National Park',
    description: 'Home to the majestic leopard.',
    image: 'https://images.unsplash.com/photo-1625736301386-79df30dfbc0b?auto=format&fit=crop&q=80&w=1280',
    span: 'md:col-span-1 md:row-span-2'
  },
  {
    id: 4,
    name: 'Galle Fort',
    description: 'Dutch colonial history.',
    image: 'https://images.unsplash.com/photo-1579970966953-b0fc5ee818bb?auto=format&fit=crop&q=80&w=1280',
    span: 'md:col-span-2 md:row-span-1'
  },
  {
    id: 5,
    name: 'Mirissa Coast',
    description: 'Whale watching and pristine beaches.',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=1280',
    span: 'md:col-span-1 md:row-span-1'
  },
];

export default function GoPage() {
  return (
    <main className="min-h-screen bg-zinc-100 pt-20 pb-12 px-4 md:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 mb-4">Go</h1>
          <p className="text-zinc-600 text-lg max-w-2xl mx-auto">
            Explore Sri Lanka's most iconic destinations in a bold, cinematic bento grid. Click any tile to dive deeper.
          </p>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px] lg:auto-rows-[260px]">
          {LOCATIONS.map((loc) => (
            <Link
              key={loc.id}
              href={`/destinations/${loc.name.toLowerCase().replace(/ /g, '-')}`}
              className={`relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 ${loc.span}`}
            >
              <Image
                src={loc.image}
                alt={loc.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 z-10 text-white">
                <h2 className="text-xl md:text-2xl font-semibold drop-shadow-sm">{loc.name}</h2>
                <p className="text-sm md:text-base opacity-80 mt-1">{loc.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
