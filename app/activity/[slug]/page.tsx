import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Clock, Users, ArrowLeft, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { BookingDrawer } from "@/components/activity/BookingDrawer"

// Fallback data for the specific slugs if DB is not ready
const MOCK_DETAILS: Record<string, any> = {
  'secret-sunset-surf-hiriketiya': {
    id: '1',
    title: 'Secret Sunset Surf Lesson',
    provider_name: 'Hiriketiya Surf School',
    location: 'Hiriketiya',
    duration: '2 hours',
    price_usd: 35.00,
    price_lkr_approx: 10500.00,
    max_capacity: 6,
    description: 'Join our expert local instructors for a magical sunset surf session in the hidden bay of Hiriketiya. Perfect for beginners and intermediates. We provide everything you need to catch your first wave or improve your skills as the sun dips below the Indian Ocean.',
    inclusions: ['Surfboard rental', '1.5 hours of instruction', 'Rash guard', 'Post-surf king coconut'],
    cover_image_url: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    gallery_urls: ['https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
  }
}

export default async function ActivityPage({ params }: { params: { slug: string } }) {
  let activity = null;

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('slug', params.slug)
      .single()

    if (data) {
      activity = data;
    }
  } catch (err) {
    // fallback to mock
  }

  if (!activity) {
    activity = MOCK_DETAILS[params.slug];
  }

  if (!activity) {
    notFound();
  }

  return (
    <div className="bg-zinc-50 min-h-screen pb-32 md:pb-12">
      {/* Mobile Back Button */}
      <div className="absolute top-4 left-4 z-20 md:hidden">
        <Link href="/" className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-5 h-5 text-zinc-900" />
        </Link>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[40vh] md:h-[60vh] max-w-7xl mx-auto md:mt-8 md:rounded-3xl overflow-hidden">
        <Image
          src={activity.cover_image_url}
          alt={activity.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-12 text-white">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-emerald-600 rounded-full text-xs font-semibold backdrop-blur-sm">
              {activity.location}
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight max-w-3xl leading-tight">
            {activity.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-10">
          
          {/* Quick Info */}
          <div className="flex flex-wrap gap-4 p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <div className="flex items-center gap-2 text-zinc-700">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">{activity.duration}</span>
            </div>
            <div className="w-px h-6 bg-zinc-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-zinc-700">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">{activity.location}</span>
            </div>
            <div className="w-px h-6 bg-zinc-200 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-zinc-700">
              <Users className="w-5 h-5 text-emerald-600" />
              <span className="font-medium">Up to {activity.max_capacity} people</span>
            </div>
          </div>

          {/* Description */}
          <section>
            <h2 className="text-2xl font-bold text-zinc-900 mb-4">About this experience</h2>
            <p className="text-zinc-600 leading-relaxed text-lg">
              {activity.description}
            </p>
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-500">
              Provided by <span className="font-semibold text-zinc-900">{activity.provider_name}</span>
            </div>
          </section>

          {/* Inclusions */}
          {activity.inclusions && activity.inclusions.length > 0 && (
            <section className="bg-emerald-50 rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-emerald-900 mb-6">What's included</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activity.inclusions.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                    </div>
                    <span className="text-emerald-900/80 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Photo Gallery (Simple Mock) */}
          {activity.gallery_urls && activity.gallery_urls.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-zinc-900 mb-4">Gallery</h2>
              <div className="grid grid-cols-2 gap-4">
                {activity.gallery_urls.map((url: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-2xl overflow-hidden">
                    <Image src={url} alt="Gallery image" fill className="object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar / Desktop Booking */}
        <div className="hidden md:block w-full max-w-md">
          <div className="sticky top-24">
            <BookingDrawer
              activityId={activity.id}
              title={activity.title}
              priceUsd={activity.price_usd}
              priceLkrApprox={activity.price_lkr_approx}
              maxCapacity={activity.max_capacity}
            />
          </div>
        </div>
      </div>

      {/* Mobile Booking Widget (Sticky Bottom) */}
      <div className="md:hidden">
        <BookingDrawer
          activityId={activity.id}
          title={activity.title}
          priceUsd={activity.price_usd}
          priceLkrApprox={activity.price_lkr_approx}
          maxCapacity={activity.max_capacity}
        />
      </div>
    </div>
  )
}
