import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Clock, Users, ArrowLeft, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { BookingDrawer } from "@/components/activity/BookingDrawer"
import { ActivityReviews } from "@/components/activity/ActivityReviews"
import { ActivityMap } from "@/components/activity/ActivityMap"
import { getExchangeRate } from "@/app/actions/settings"

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

export default async function ActivityPage({ params }: { params: Promise<{ slug: string }> }) {
  let activity = null;
  const { slug } = await params;
  
  // Fetch live or custom exchange rate
  const exchangeRate = await getExchangeRate();

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('*, reviews(*)')
      .eq('slug', slug)
      .single()

    if (data) {
      activity = data;
    }
  } catch (err) {
    // fallback to mock
  }

  if (!activity) {
    activity = MOCK_DETAILS[slug];
  }

  if (!activity) {
    notFound();
  }

  const reviewCount = activity.reviews ? activity.reviews.length : 0;
  const avgRating = reviewCount > 0 
    ? activity.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount
    : undefined;

  return (
    <div className="bg-white min-h-screen pb-32 md:pb-12">
      {/* Mobile Back Button */}
      <div className="absolute top-4 left-4 z-20 md:hidden">
        <Link href="/" className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
          <ArrowLeft className="w-5 h-5 text-zinc-900" />
        </Link>
      </div>

      {/* Hero Image */}
      <div className="relative w-full h-[45vh] md:h-[65vh] md:mt-6 max-w-[1400px] mx-auto md:rounded-3xl overflow-hidden shadow-2xl">
        <Image
          src={activity.cover_image_url}
          alt={activity.title}
          fill
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-16 text-white w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-4 py-1.5 bg-rose-500 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg shadow-rose-500/30">
                  {activity.location}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl leading-tight drop-shadow-md">
                {activity.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-12">
        <div className="flex-1 space-y-12">
          
          {/* Quick Info Pills */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase">Duration</span>
                <span className="font-semibold text-zinc-900">{activity.duration}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase">Location</span>
                <span className="font-semibold text-zinc-900">{activity.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-50 rounded-2xl border border-zinc-100">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase">Capacity</span>
                <span className="font-semibold text-zinc-900">Up to {activity.max_capacity}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <section>
            <h2 className="text-3xl font-bold text-zinc-900 mb-6">About this experience</h2>
            <p className="text-zinc-600 leading-relaxed text-lg font-medium">
              {activity.description}
            </p>
            <div className="mt-6 flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl w-fit">
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center">
                <span className="font-bold text-zinc-500">{activity.provider_name.charAt(0)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase">Hosted By</span>
                <span className="font-bold text-zinc-900">{activity.provider_name}</span>
              </div>
            </div>
          </section>

          {/* Rough Location Map */}
          <ActivityMap lat={activity.approx_lat} lng={activity.approx_lng} />

          {/* Inclusions */}
          {activity.inclusions && activity.inclusions.length > 0 && (
            <section className="bg-rose-50/50 rounded-3xl p-8 md:p-10 border border-rose-100">
              <h2 className="text-2xl font-bold text-zinc-900 mb-8">What's included</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {activity.inclusions.map((item: string, i: number) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-rose-500/20">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-zinc-800 font-semibold">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Photo Gallery */}
          {activity.gallery_urls && activity.gallery_urls.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold text-zinc-900 mb-6">Gallery</h2>
              <div className="grid grid-cols-2 gap-4">
                {activity.gallery_urls.map((url: string, i: number) => (
                  <div key={i} className="relative aspect-video rounded-3xl overflow-hidden shadow-sm group">
                    <Image src={url} alt="Gallery image" fill placeholder="blur" blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews Section */}
          <ActivityReviews reviews={activity.reviews} />
        </div>

        {/* Sidebar / Desktop Booking */}
        <div className="hidden md:block w-full max-w-[420px]">
          <div className="sticky top-28">
            <BookingDrawer
              activityId={activity.id}
              title={activity.title}
              priceUsd={activity.price_usd}
              priceLkrApprox={Math.round(activity.price_usd * exchangeRate)}
              maxCapacity={activity.max_capacity}
              pricingTiers={activity.pricing_tiers}
              tourOptions={activity.tour_options}
              paymentStrategy={activity.payment_strategy}
              hasPickup={activity.has_pickup}
              blackoutDates={activity.blackout_dates || []}
              isHiddenGem={activity.is_hidden_gem}
              rating={avgRating}
              reviewCount={reviewCount}
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
          priceLkrApprox={Math.round(activity.price_usd * exchangeRate)}
          maxCapacity={activity.max_capacity}
          pricingTiers={activity.pricing_tiers}
          tourOptions={activity.tour_options}
          paymentStrategy={activity.payment_strategy}
          hasPickup={activity.has_pickup}
          blackoutDates={activity.blackout_dates || []}
          isHiddenGem={activity.is_hidden_gem}
          rating={avgRating}
          reviewCount={reviewCount}
        />
      </div>
    </div>
  )
}
