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

export default function GoNowPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Go Now (Debug Layout)</h1>
        <div className="flex flex-col gap-8">
          {LOCATIONS.map((loc) => (
            <div key={loc.id} className="border border-gray-200 p-4 rounded-lg flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 h-64 relative bg-gray-100">
                <Image
                  src={loc.image}
                  alt={loc.name}
                  fill
                  unoptimized
                  className="object-cover rounded"
                />
              </div>
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <h2 className="text-2xl font-semibold mb-2">{loc.name}</h2>
                <p className="text-gray-600">{loc.description}</p>
                <p className="text-xs text-gray-400 mt-4 break-all">Image URL: {loc.image}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
