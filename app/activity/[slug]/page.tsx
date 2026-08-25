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
import { MobileBackButton } from "@/components/ui/MobileBackButton"
import { getExchangeRate } from "@/app/actions/settings"
import { ActivityCard } from "@/components/activity/ActivityCard"
import ReactMarkdown from "react-markdown"
import { incrementActivityView } from "@/app/actions/tracking"

import { Metadata, ResolvingMetadata } from 'next'

export const revalidate = 60;


type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params

  let activity = null

  try {
    const { data } = await supabase
      .from('activities')
      .select('id, title, description, cover_image_url, location')
      .eq('slug', slug)
      .eq('status', 'published')
      .eq('is_paused_by_host', false)
      .single()

    if (data) {
      activity = data
      // Fire-and-forget the view tracking (doesn't block render)
      incrementActivityView(activity.id)
    }
  } catch (err) { }


  if (!activity) {
    return {
      title: 'Activity Not Found | Islandfull'
    }
  }

  return {
    title: `${activity.title} in ${activity.location} | Islandfull`,
    description: activity.description,
    openGraph: {
      title: `${activity.title} | Islandfull`,
      description: activity.description,
      images: [{ url: activity.cover_image_url }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${activity.title} | Islandfull`,
      description: activity.description,
      images: [activity.cover_image_url],
    },
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
      .eq('is_paused_by_host', false)
      .single()

    if (data) {
      activity = data;
    }
  } catch (err) {
    // fallback to mock
  }


  if (!activity) {
    notFound();
  }

  const reviewCount = activity.reviews ? activity.reviews.length : 0;
  const avgRating = reviewCount > 0
    ? activity.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount
    : undefined;

  let moreActivities: any[] = [];
  let blockedDates: string[] = [];

  if (activity) {
    if (activity.host_id) {
      const { data: moreData } = await supabase
        .from('activities')
        .select('id, title, slug, location, duration, price_usd, price_suffix, card_image_url, cover_image_url, is_hidden_gem, max_capacity, pricing_model, reviews(rating)')
        .eq('host_id', activity.host_id)
        .eq('status', 'published')
        .eq('is_paused_by_host', false)
        .neq('id', activity.id)
        .limit(4);

      if (moreData) {
        moreActivities = moreData;
      }
    }

    const { data: blocks } = await supabase
      .from('activity_blocks')
      .select('blocked_date')
      .eq('activity_id', activity.id);

    if (blocks) {
      blockedDates = blocks.map(b => b.blocked_date);
    }
  }

  const allBlackoutDates = [...(activity?.blackout_dates || []), ...blockedDates];

  const isEvent = activity.category_type === 'event';

  return (
    <div className="bg-white min-h-screen pb-32 md:pb-12">
      {/* Hero Image */}
      <div className="relative h-[35svh] md:h-[600px] m-3 sm:m-0 md:mx-auto md:w-full md:mt-6 max-w-[1400px] rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Mobile Back Button */}
        <div className="absolute top-4 left-4 z-50 md:hidden">
          <MobileBackButton />
        </div>
        <Image
          src={activity.cover_image_url}
          alt={activity.title}
          fill
          sizes="100vw"
          quality={100}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII="
          className="object-cover object-center"
          priority={true}
          fetchPriority="high"
        />
        {/* Top Gradient for Header Legibility */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-10"></div>

        <FavoriteButton activityId={activity.id} className="hidden md:flex" />
        <div className="absolute bottom-0 left-0 right-0 w-full pb-4 md:pb-8 z-10">
          <div className="max-w-7xl mx-auto px-4 flex flex-col items-start gap-2">
            <div className="hidden md:flex items-center gap-2">
              <span className="px-2.5 py-1 md:px-4 md:py-1.5 bg-rose-500 text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm drop-shadow-md">
                {activity.location}
              </span>
            </div>
            <h1
              className="text-[clamp(0.875rem,calc(120vw/var(--char-count)),1.25rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:leading-tight md:whitespace-normal md:overflow-visible font-bold tracking-tight text-white drop-shadow-md"
              style={{ '--char-count': activity.title.length } as React.CSSProperties}
            >
              {activity.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 md:py-12 flex flex-col md:flex-row gap-4 md:gap-12">
        <div className="flex-1 space-y-6 md:space-y-12">

          {/* Quick Info (Mobile Minimalist Row) */}
          <div className="flex md:hidden items-center justify-between w-full pt-2 pb-4 px-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 md:px-4 md:py-1.5 bg-rose-500 text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider shadow-sm drop-shadow-md">
                {activity.location}
              </span>
            </div>

            <div className="flex flex-row items-center gap-1.5">
              <Clock className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-gray-800">{activity.duration}</span>
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
            <div className="mt-6">
              {(() => {
                const hostName = activity.hosts?.name || activity.provider_name || 'Islandfull Partner';
                return (
                  <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-2xl w-fit border border-zinc-100">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center overflow-hidden relative shadow-sm border border-zinc-200 shrink-0">
                      {activity.hosts?.image_url ? (
                        <Image src={activity.hosts.image_url} alt={hostName} fill className="object-cover" />
                      ) : (
                        <span className="font-bold text-zinc-500">{hostName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Hosted By</span>
                      <span className="font-bold text-zinc-900 text-sm md:text-base">{hostName}</span>
                    </div>
                  </div>
                );
              })()}
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
              blackoutDates={allBlackoutDates}
              isHiddenGem={activity.is_hidden_gem}
              rating={avgRating}
              reviewCount={reviewCount}
              minNoticeDays={activity.min_notice_days}
              bookingType={activity.booking_type || 'single_day'}
              pricingModel={activity.pricing_model || 'per_person'}
              hostAvatar={activity.hosts?.avatar_url || activity.hosts?.image_url}
              hostName={activity.hosts?.name || activity.provider_name}
              cancellationTier={activity.cancellation_tier}
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
          blackoutDates={allBlackoutDates}
          isHiddenGem={activity.is_hidden_gem}
          rating={avgRating}
          reviewCount={reviewCount}
          minNoticeDays={activity.min_notice_days}
          bookingType={activity.booking_type || 'single_day'}
          pricingModel={activity.pricing_model || 'per_person'}
          hostAvatar={activity.hosts?.avatar_url || activity.hosts?.image_url}
          hostName={activity.hosts?.name || activity.provider_name}
          cancellationTier={activity.cancellation_tier}
        />
      </div>
    </div>
  )
}
