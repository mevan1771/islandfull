
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

// Mock data fallback if DB fails
const MOCK_ACTIVITIES = [
  {
    id: '1', title: 'Secret Sunset Surf Lesson', slug: 'secret-sunset-surf-hiriketiya',
    location: 'Hiriketiya', duration: '2 hours', priceUsd: 35.00,
    coverImage: 'https://images.pexels.com/photos/1243337/pexels-photo-1243337.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2', title: 'Yala Leopard Safari in 4x4', slug: 'yala-leopard-safari',
    location: 'Yala', duration: 'Half Day', priceUsd: 75.00,
    coverImage: 'https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '3', title: 'Ella Nine Arch Trek', slug: 'ella-nine-arch-trek',
    location: 'Ella', duration: '6 hours', priceUsd: 45.00,
    coverImage: 'https://images.pexels.com/photos/1368382/pexels-photo-1368382.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '4', title: 'Sigiriya Rock Climb', slug: 'sigiriya-rock-fortress-climb',
    location: 'Sigiriya', duration: '3 hours', priceUsd: 20.00,
    coverImage: 'https://images.pexels.com/photos/2444403/pexels-photo-2444403.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
]

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  let activities = MOCK_ACTIVITIES;
  let featuredSpotlight: any = null;
  
  try {
    const currentVertical = params.vertical || 'tour';
    
    // Fetch the dynamic spotlight settings from global_settings
    const { data: spotlightSetting } = await supabase
      .from('global_settings')
      .select('value')
      .eq('key', 'featured_spotlight')
      .single();
      
    if (spotlightSetting && spotlightSetting.value) {
      featuredSpotlight = spotlightSetting.value;
    }

    let query = supabase.from('activities').select('*, categories!inner(slug), reviews(rating)')
      .eq('category_type', currentVertical)
      .eq('status', 'published')
      .eq('is_paused_by_host', false);
    
    if (params.location) {
      query = query.or(`title.ilike.%${params.location}%,location.ilike.%${params.location}%`);
    }
    
    if (params.category && params.category !== 'saved') {
      query = query.eq('categories.slug', params.category);
    }
    // Always prioritize featured tours, then sort by newest first
    query = query.order('is_featured', { ascending: false, nullsFirst: false });

    if (params.sort === 'price_asc') {
      query = query.order('price_usd', { ascending: true });
    } else if (params.sort === 'price_desc') {
      query = query.order('price_usd', { ascending: false });
    } else {
      // Default sort for maximum visibility of new tours
      query = query.order('created_at', { ascending: false });
    }

    // If viewing saved, we might need more than 12 to filter on client, so grab up to 50
    const fetchLimit = params.category === 'saved' ? 50 : 12;
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

  const currentVertical = params.vertical || 'tour';
  const currentCategory = params.category || 'all';

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

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <HeroCarousel tours={featuredTours} introSlide={introSlide} />

      {/* Mobile Search Inline Card */}
      <Suspense fallback={null}>
        <MobileSearch />
      </Suspense>

      {/* Dynamic Filters UI */}
      <Suspense fallback={<div className="h-40"></div>}>
        <HomeFilters dynamicCategories={dynamicCategories} />
      </Suspense>

      {/* Activity Grid */}
      <section id="activity-grid-container" className="max-w-7xl mx-auto px-4 py-8">
        <ActivityGrid activities={activities} currentCategory={currentCategory} />
      </section>

      {/* Featured Tour Spotlight Carousel */}
      {featuredSpotlight && (
        <SpotlightCarousel slides={Array.isArray(featuredSpotlight) ? featuredSpotlight : [featuredSpotlight]} />
      )}

    </div>
  )
}
