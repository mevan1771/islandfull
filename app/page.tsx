
import { ActivityCard } from "@/components/activity/ActivityCard"
import { HomeFilters } from "@/components/home/HomeFilters"
import { MobileSearch } from "@/components/home/MobileSearch"
import { ActivityGrid } from "@/components/home/ActivityGrid"
import { SpotlightCarousel } from "@/components/home/SpotlightCarousel"
import { Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { HeroCarousel } from "@/components/home/HeroCarousel"
import Image from "next/image"
import Link from "next/link"



export const revalidate = 3600; // Cache for 1 hour to improve FCP

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const currentVertical = params.vertical || 'tour';
  const currentCategory = params.category || 'all';

  let featuredSpotlight: any = null;
  try {
    const { data: spotlightSetting } = await supabase
      .from('global_settings')
      .select('value')
      .eq('key', 'featured_spotlight')
      .single();

    if (spotlightSetting && spotlightSetting.value) {
      featuredSpotlight = spotlightSetting.value;
    }
  } catch (e) {
    console.error("Failed to fetch featured spotlight:", e);
  }



  let dynamicCategories: any[] = [];
  try {
    const { data: catData } = await supabase
      .from('categories')
      .select('name, slug')
      .eq('category_type', currentVertical)
      .order('sort_order', { ascending: true })
      .order('name');

    if (catData) {
      dynamicCategories = catData;
    }
  } catch (e) {
    console.error("Failed to fetch dynamic categories:", e);
  }

  let featuredTours = [];
  try {
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('status', 'published')
      .eq('is_paused_by_host', false)
      .eq('is_featured', true)
      .order('featured_order', { ascending: true })
      .limit(5);

    if (data) featuredTours = data;
  } catch (e) {
    console.error("Failed to fetch featured tours:", e);
  }

  let introSlide = null;
  try {
    const { data } = await supabase
      .from('global_settings')
      .select('value')
      .eq('key', 'hero_intro_slide')
      .single();
    if (data) introSlide = data.value;
  } catch (e) {
    console.error("Failed to fetch intro slide:", e);
  }

  
  const carouselSlides = [
    {
      id: 'static-intro',
      title: introSlide?.title ?? 'Your Journey in Sri Lanka Begins Here',
      subtitle: introSlide?.subtitle ?? 'Inspiration, planning, and booking—all in one place.',
      slug: '',
      cover_image_url: introSlide?.cover_image_url || 'https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      isStatic: true,
      use_dark_text_desktop: introSlide?.use_dark_text_desktop || introSlide?.useDarkText || false,
      use_dark_text_mobile: introSlide?.use_dark_text_mobile || introSlide?.useDarkText || false
    },
    ...featuredTours
  ];

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <HeroCarousel carouselSlides={carouselSlides} />

      {/* Mobile Search Inline Card */}
      <Suspense fallback={null}>
        <MobileSearch />
      </Suspense>

      {/* Dynamic Filters UI */}
      <Suspense fallback={<div className="h-40"></div>}>
        <HomeFilters dynamicCategories={dynamicCategories} />
      </Suspense>

      {/* Activity Grid */}
      <section id="activity-grid-container" className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        <Suspense fallback={<ActivitySkeleton />}>
          <ActivityGridServer searchParams={params} currentCategory={currentCategory} />
        </Suspense>
      </section>

      {/* Featured Tour Spotlight Carousel */}
      {featuredSpotlight && (
        <SpotlightCarousel slides={Array.isArray(featuredSpotlight) ? featuredSpotlight : [featuredSpotlight]} />
      )}

    </div>
  )
}

const ActivitySkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex flex-col gap-3">
        <div className="w-full aspect-[4/3] bg-zinc-100 rounded-2xl animate-pulse"></div>
        <div className="w-3/4 h-4 bg-zinc-100 rounded animate-pulse"></div>
        <div className="w-1/2 h-4 bg-zinc-100 rounded animate-pulse"></div>
      </div>
    ))}
  </div>
);

async function ActivityGridServer({ searchParams, currentCategory }: { searchParams: any, currentCategory: string }) {
  let activities: any[] = [];
  try {
    const currentVertical = searchParams.vertical || 'tour';
    let query = supabase.from('activities').select('*, categories!inner(slug), reviews(rating)')
      .eq('category_type', currentVertical)
      .eq('status', 'published')
      .eq('is_paused_by_host', false);

    if (searchParams.location) {
      query = query.or(`title.ilike.%${searchParams.location}%,location.ilike.%${searchParams.location}%`);
    }

    if (searchParams.category && searchParams.category !== 'saved') {
      query = query.eq('categories.slug', searchParams.category);
    }
    // Always prioritize featured tours, then sort by newest first
    query = query.order('is_featured', { ascending: false, nullsFirst: false });

    if (searchParams.sort === 'price_asc') {
      query = query.order('price_usd', { ascending: true });
    } else if (searchParams.sort === 'price_desc') {
      query = query.order('price_usd', { ascending: false });
    } else {
      // Default sort for maximum visibility of new tours
      query = query.order('created_at', { ascending: false });
    }

    // If viewing saved, we might need more than 12 to filter on client, so grab up to 50
    const fetchLimit = searchParams.category === 'saved' ? 50 : 12;
    const { data, error } = await query.limit(fetchLimit);

    if (error) {
      console.error("Supabase query error:", error);
    } else if (data && data.length > 0) {
      activities = data.map(d => {
        const rating = d.reviews && d.reviews.length > 0
          ? d.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / d.reviews.length
          : undefined;

        return {
          id: d.id,
          title: d.title,
          slug: d.slug,
          location: d.location,
          duration: d.duration,
          priceUsd: d.price_usd,
          price_suffix: d.price_suffix,
          coverImage: d.card_image_url || d.cover_image_url,
          isHiddenGem: d.is_hidden_gem,
          rating: rating,
          reviewCount: d.reviews ? d.reviews.length : 0,
          pricingModel: d.pricing_model,
          maxGuests: d.max_capacity
        };
      });
    }
  } catch (e) {
    console.error("Failed to fetch activities:", e);
  }

  return <ActivityGrid activities={activities} currentCategory={currentCategory} />;
}
