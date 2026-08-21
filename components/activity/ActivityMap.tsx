"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// Dynamically import the Leaflet map to avoid SSR issues
const ActivityMapInner = dynamic(
  () => import('./ActivityMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full min-h-[300px] rounded-3xl bg-zinc-50 border border-zinc-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    )
  }
)

export function ActivityMap({ lat, lng }: { lat: number, lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load slightly before it enters the viewport
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!lat || !lng) return null;

  return (
    <div ref={containerRef}>
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Where you'll be</h2>
      <p className="text-zinc-500 mb-6">Exact meeting point provided after booking confirmation.</p>

      <div className="w-full aspect-[4/3] md:aspect-[21/9]">
        {isInView ? (
          <ActivityMapInner lat={lat} lng={lng} />
        ) : (
          <div className="w-full h-full min-h-[300px] rounded-3xl bg-zinc-50 border border-zinc-200 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          </div>
        )}
      </div>
    </div>
  )
}
