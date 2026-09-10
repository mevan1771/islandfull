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
  {
    id: 6,
    name: 'Kandy Lake',
    description: 'Spiritual heart of the island.',
    image: '/images/destinations/kandy.jpg',
    span: 'md:col-span-2 md:row-span-2'
  },
  {
    id: 7,
    name: 'Ella Rock',
    description: 'Breathtaking mountain views.',
    image: '/images/destinations/ella.jpg',
    span: 'md:col-span-1 md:row-span-1'
  },
  {
    id: 8,
    name: 'Arugam Bay',
    description: 'Surfers paradise.',
    image: '/images/destinations/arugam_bay.jpg',
    span: 'md:col-span-1 md:row-span-2'
  },
  {
    id: 9,
    name: 'Trincomalee',
    description: 'Pristine white sand beaches.',
    image: '/images/destinations/trincomalee.jpg',
    span: 'md:col-span-1 md:row-span-1'
  },
  {
    id: 10,
    name: 'Nuwara Eliya',
    description: 'Little England tea country.',
    image: '/images/destinations/nuwara_eliya.jpg',
    span: 'md:col-span-1 md:row-span-1'
  }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0 auto-rows-[200px] lg:auto-rows-[260px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-zinc-900">
          {LOCATIONS.map((loc) => (
            <Link
              key={loc.id}
              href={`/destinations/${loc.name.toLowerCase().replace(/ /g, '-')}`}
              className={`relative group overflow-hidden transition-all duration-500 ${loc.span} border-[0.5px] border-zinc-800`}
            >
              <Image
                src={loc.image}
                alt={loc.name}
                fill
                unoptimized
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
