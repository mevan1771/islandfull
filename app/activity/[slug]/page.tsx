import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Clock, Users, ArrowLeft, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { BookingDrawer } from "@/components/activity/BookingDrawer"
import { ActivityReviews } from "@/components/activity/ActivityReviews"
import { ActivityMap } from "@/components/activity/ActivityMap"
import { ActivityGallery } from "@/components/activity/ActivityGallery"
import { FavoriteButton } from "@/components/ui/FavoriteButton"
import { getExchangeRate } from "@/app/actions/settings"
import { ActivityCard } from "@/components/activity/ActivityCard"
import ReactMarkdown from "react-markdown"

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
      .select('*, reviews(*), hosts(*)')
      .eq('slug', slug)
      .eq('status', 'published')
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

  let moreActivities = [];
  if (activity?.host_id) {
    const { data: moreData } = await supabase
      .from('activities')
      .select('*, reviews(rating)')
      .eq('host_id', activity.host_id)
      .eq('status', 'published')
      .neq('id', activity.id)
      .limit(4);
    
    if (moreData) {
      moreActivities = moreData;
    }
  }

  return (
    <div className="bg-white min-h-screen pb-32 md:pb-12">
      {/* Hero Image */}
      <div className="relative h-[35vh] md:h-[65vh] m-3 sm:m-0 md:mx-auto md:w-full md:mt-6 max-w-[1400px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl">
        {/* Mobile Back Button */}
        <div className="absolute top-4 left-4 z-20 md:hidden">
          <Link href="/" className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center shadow-sm">
            <ArrowLeft className="w-4 h-4 text-white" />
          </Link>
        </div>
        <Image
          src={activity.cover_image_url}
          alt={activity.title}
          fill
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
          className="object-cover"
          priority
        />
        <FavoriteButton activityId={activity.id} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6 md:p-16 text-white w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
            <div>
              <div className="hidden md:flex items-center gap-2 mb-4">
                <span className="px-4 py-1.5 bg-rose-500 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-lg shadow-rose-500/30">
                  {activity.location}
                </span>
              </div>
              <h1 className="text-2xl md:text-6xl font-bold tracking-tight max-w-3xl leading-tight drop-shadow-md">
                {activity.title}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 md:py-12 flex flex-col md:flex-row gap-4 md:gap-12">
        <div className="flex-1 space-y-6 md:space-y-12">
          
          {/* Quick Info (Mobile Minimalist Row) */}
          <div className="flex md:hidden items-center justify-between w-full pt-2 pb-4 px-4 border-b border-gray-100">
            <div className="flex flex-row items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-gray-800">{activity.duration}</span>
            </div>
            
            <div className="flex flex-row items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-gray-800 max-w-[120px] truncate">{activity.location}</span>
            </div>

            <div className="flex flex-row items-center gap-1.5">
              <Users className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-gray-800">Up to {activity.max_capacity}</span>
            </div>
          </div>

          {/* Quick Info (Desktop Balloons) */}
          <div className="hidden md:flex flex-wrap gap-4 w-full py-2">
            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase">Duration</span>
                <span className="text-base font-semibold text-zinc-900">{activity.duration}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <MapPin className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase">Location</span>
                <span className="text-base font-semibold text-zinc-900">{activity.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <Users className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase">Capacity</span>
                <span className="text-base font-semibold text-zinc-900">Up to {activity.max_capacity}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">About this experience</h2>
            <div className="text-zinc-600 leading-relaxed text-sm md:text-lg font-medium space-y-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mt-4 [&>ul>li]:pl-1 [&>ul>li]:my-1 [&>ul>li::marker]:text-rose-500 [&>strong]:text-zinc-900 [&>strong]:font-bold [&>p]:mb-2">
              <ReactMarkdown>{activity.description}</ReactMarkdown>
            </div>
            <div className="mt-6 flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl w-fit">
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden relative shadow-sm border border-zinc-200">
                {activity.hosts?.image_url ? (
                  <Image src={activity.hosts.image_url} alt={activity.hosts?.name || activity.provider_name} fill className="object-cover" />
                ) : (
                  <span className="font-bold text-zinc-500">{(activity.hosts?.name || activity.provider_name).charAt(0)}</span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-zinc-400 uppercase">Hosted By</span>
                <span className="font-bold text-zinc-900">{activity.hosts?.name || activity.provider_name}</span>
              </div>
            </div>
          </section>

          {/* Rough Location Map */}
          <ActivityMap lat={activity.approx_lat} lng={activity.approx_lng} />

          {/* Inclusions */}
          {activity.inclusions && activity.inclusions.length > 0 && (
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">What's included</h2>
              <ul className="grid grid-cols-2 gap-y-3 gap-x-4 w-full">
                {activity.inclusions.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="mt-0.5 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-gray-700 text-sm font-medium leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Photo Gallery */}
          <ActivityGallery galleryUrls={activity.gallery_urls} />

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
              minNoticeDays={activity.min_notice_days}
            />
          </div>
        </div>
      </div>

      {/* More from Host */}
      {moreActivities && moreActivities.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="border-t border-zinc-200 pt-12">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-8 mb-3">
              More from {activity.hosts?.name || activity.provider_name}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {moreActivities.map((d: any) => {
                let rating = 0;
                if (d.reviews && d.reviews.length > 0) {
                  rating = d.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / d.reviews.length;
                }
                
                return (
                  <ActivityCard
                    key={d.id}
                    id={d.id}
                    title={d.title}
                    slug={d.slug}
                    location={d.location}
                    duration={d.duration}
                    priceUsd={d.price_usd}
                    coverImage={d.cover_image_url || '/placeholder.jpg'}
                    isHiddenGem={d.is_hidden_gem}
                    rating={rating}
                    reviewCount={d.reviews ? d.reviews.length : 0}
                  />
                )
              })}
            </div>
          </div>
        </div>
      )}

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
          minNoticeDays={activity.min_notice_days}
        />
      </div>
    </div>
  )
}
