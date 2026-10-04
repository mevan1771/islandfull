import Image from "next/image"
import { HeaderThemeSetter } from "@/components/layout/HeaderThemeSetter"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Check, MapPin } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { BookingDrawer } from "@/components/activity/BookingDrawer"
import { ActivityReviews } from "@/components/activity/ActivityReviews"
import { ActivityMap } from "@/components/activity/ActivityMap"
import { ActivityGallery } from "@/components/activity/ActivityGallery"
import { ActivityHeroCollage } from "@/components/activity/ActivityHeroCollage"
import { FaqAccordion } from "@/components/activity/FaqAccordion"
import { FavoriteButton } from "@/components/ui/FavoriteButton"
import { MobilePaddingSetter } from "@/components/activity/MobilePaddingSetter"
import { getExchangeRate } from "@/app/actions/settings"
import { ActivityCard } from "@/components/activity/ActivityCard"
import ReactMarkdown from "react-markdown"
import { ScrollToTop } from "@/components/activity/ScrollToTop"
import { ActivityMetaBar } from "@/components/activity/ActivityMetaBar"
import { DESTINATIONS, activityBelongsToDestination } from "@/lib/destinations"

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

    let cancellationTierData = null;
    if (activity.cancellation_tier) {
        const { data } = await supabase.from('cancellation_tiers').select('*').eq('id', activity.cancellation_tier).single();
        if (data) cancellationTierData = data;
    }

    const reviewCount = activity.reviews ? activity.reviews.length : 0;
    const avgRating = reviewCount > 0
        ? activity.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount
        : undefined;

    let moreActivities: any[] = [];
    let nearbyTours: any[] = [];
    let blockedDates: string[] = [];
    const isPlace = activity.category_type === "place";

    if (activity) {
        if (isPlace) {
            const placeCoords = (() => {
                const lat = activity.approx_lat != null ? parseFloat(activity.approx_lat) : NaN
                const lng = activity.approx_lng != null ? parseFloat(activity.approx_lng) : NaN
                if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
                return null
            })()
            const dest = DESTINATIONS.find((d) =>
                activityBelongsToDestination(d, activity.location || "", placeCoords)
            )

            const { data: tours } = await supabase
                .from("activities")
                .select("id, title, slug, location, duration, price_usd, price_suffix, card_image_url, cover_image_url, is_hidden_gem, max_capacity, pricing_model, pricing_tiers, approx_lat, approx_lng, reviews(rating)")
                .eq("category_type", "tour")
                .eq("status", "published")
                .eq("is_paused_by_host", false)
                .neq("id", activity.id)
                .limit(80)

            nearbyTours = (tours || []).filter((t: any) => {
                const lat = t.approx_lat != null ? parseFloat(t.approx_lat) : NaN
                const lng = t.approx_lng != null ? parseFloat(t.approx_lng) : NaN
                const coords = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
                if (dest) return activityBelongsToDestination(dest, t.location || "", coords)
                const loc = (t.location || "").toLowerCase()
                const here = (activity.location || "").toLowerCase()
                return here && loc.includes(here)
            }).slice(0, 8)
        } else if (activity.host_id) {
            const { data: moreData } = await supabase
                .from('activities')
                .select('id, title, slug, location, duration, price_usd, price_suffix, card_image_url, cover_image_url, is_hidden_gem, max_capacity, pricing_model, pricing_tiers, reviews(rating)')
                .eq('host_id', activity.host_id)
                .eq('status', 'published')
                .eq('is_paused_by_host', false)
                .neq('category_type', 'place')
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

    const upgradeUnsplashUrl = (url: string) => {
        if (!url) return "";
        if (url.includes('images.unsplash.com')) {
            try {
                const urlObj = new URL(url);
                urlObj.searchParams.set('w', '2500');
                urlObj.searchParams.set('q', '90');
                return urlObj.toString();
            } catch (e) {
                return url;
            }
        }
        return url;
    }

    return (
        <div className="bg-white min-h-screen md:pb-12">
            <ScrollToTop />
            <MobilePaddingSetter enabled={!isPlace} />
            <HeaderThemeSetter useDarkTextDesktop={activity.use_dark_text_desktop} useDarkTextMobile={activity.use_dark_text_mobile} />

            <ActivityHeroCollage
                coverUrl={upgradeUnsplashUrl(activity.cover_image_url) || "/placeholder.jpg"}
                galleryUrls={activity.gallery_urls}
                title={activity.title}
            />

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 pt-3 pb-6 md:py-12 flex flex-col md:flex-row gap-4 md:gap-12">
                <div className="flex-1 space-y-6 md:space-y-12">

                    <div className="space-y-2.5 md:space-y-3">
                        <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-700 leading-tight">
                            {activity.title}
                        </h1>
                        <ActivityMetaBar
                        tourId={activity.id}
                        location={activity.location}
                        duration={activity.duration}
                        capacityLabel={
                            activity.min_guests && activity.min_guests > 1
                                ? `${activity.min_guests}-${activity.max_capacity}`
                                : `${activity.max_capacity}`
                        }
                        initialLikes={activity.like_count || 0}
                        initialViews={activity.view_count || 0}
                        dealEndDate={activity.deal_end_date}
                        hasActiveDeal={Boolean(
                            activity.discount_price &&
                            activity.deal_end_date &&
                            new Date(activity.deal_end_date) > new Date()
                        )}
                        hideCapacity={isPlace}
                    />
                    </div>

                    {/* Description */}
                    <section>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{isPlace ? "About this place" : "About this experience"}</h2>
                        <div className="text-slate-600/80 leading-relaxed text-sm md:text-lg font-medium space-y-3 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mt-4 [&>ul>li]:pl-1 [&>ul>li]:my-1 [&>ul>li::marker]:text-rose-500 [&>strong]:text-slate-700/80 [&>strong]:font-bold [&>p]:mb-2">
                            <ReactMarkdown>{activity.description}</ReactMarkdown>
                        </div>
                        {!isPlace && (
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
                                            <span className="font-bold text-slate-700/80 text-sm md:text-base">{hostName}</span>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                        )}
                    </section>

                    {/* Rough Location Map */}
                    <ActivityMap lat={activity.approx_lat} lng={activity.approx_lng} />

                    {isPlace && activity.inclusions && activity.inclusions.length > 0 ? (
                        <section className="lg:hidden">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Useful tips</h2>
                            <ul className="space-y-2.5">
                                {activity.inclusions.map((item: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm md:text-[15px] text-gray-700 leading-relaxed">
                                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ) : activity.inclusions && activity.inclusions.length > 0 ? (
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
                    ) : null}


                    {/* FAQs */}
                    <FaqAccordion faqs={activity.faqs} />

                    {/* Photo Gallery */}
                    <ActivityGallery galleryUrls={activity.gallery_urls} />

                    {/* Reviews Section */}
                    <ActivityReviews reviews={activity.reviews} />
                </div>

                {/* Sidebar / Desktop Booking */}
                <div className="hidden lg:block w-full max-w-[420px]">
                    <div className="sticky top-28">
                        {isPlace ? (
                            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                                <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">Must see</p>
                                <p className="mt-2 text-2xl font-bold text-zinc-900">Free to visit</p>
                                <p className="mt-1 text-sm text-zinc-500">No reservation. Go when it suits you.</p>
                                <div className="mt-5 flex items-start gap-2 text-sm text-zinc-700">
                                    <MapPin className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                                    <span>{activity.location}</span>
                                </div>
                                {activity.duration && (
                                    <p className="mt-3 text-sm text-zinc-500">Allow {activity.duration}</p>
                                )}
                                {activity.inclusions && activity.inclusions.length > 0 && (
                                    <div className="mt-5 pt-5 border-t border-zinc-100">
                                        <p className="text-xs font-bold uppercase tracking-wide text-zinc-400 mb-3">Useful tips</p>
                                        <ul className="space-y-2.5">
                                            {activity.inclusions.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-700 leading-snug">
                                                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                        <BookingDrawer
                            activityId={activity.id}
                            title={activity.title}
                            priceUsd={activity.price_usd}
                            priceLkrApprox={Math.round(activity.price_usd * exchangeRate)}
                            maxCapacity={activity.max_capacity}
                            minGuests={activity.min_guests}
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
                            cancellationTierData={cancellationTierData}
                            discountPrice={activity.discount_price}
                            dealEndDate={activity.deal_end_date}
                            priceSuffix={activity.price_suffix}
                        />
                        )}
                    </div>
                </div>
            </div>

            {/* More from Host / Tours nearby */}
            {((isPlace ? nearbyTours : moreActivities) || []).length > 0 && (
                <div className="max-w-7xl mx-auto px-4 pb-12">
                    <div className="border-t border-zinc-200 pt-12">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mt-8 mb-3">
                            {isPlace
                                ? "Tours nearby"
                                : `More from ${activity.hosts?.name || activity.provider_name}`}
                        </h2>
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                            {(isPlace ? nearbyTours : moreActivities).map((d: any) => {
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
                                        coverImage={d.card_image_url || d.cover_image_url || '/placeholder.jpg'}
                                        isHiddenGem={d.is_hidden_gem}
                                        rating={rating}
                                        reviewCount={d.reviews ? d.reviews.length : 0}
                                        pricingTiers={d.pricing_tiers}
                                    />
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Booking Widget (Sticky Bottom) */}
            {!isPlace && (
            <div className="lg:hidden">
                <BookingDrawer
                    activityId={activity.id}
                    title={activity.title}
                    priceUsd={activity.price_usd}
                    priceLkrApprox={Math.round(activity.price_usd * exchangeRate)}
                    maxCapacity={activity.max_capacity}
                    minGuests={activity.min_guests}
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
                    cancellationTierData={cancellationTierData}
                    discountPrice={activity.discount_price}
                    dealEndDate={activity.deal_end_date}
                    priceSuffix={activity.price_suffix}
                />
            </div>
            )}
        </div>
    )
}
