import { ShieldCheck, Tag, HeartHandshake } from "lucide-react"
import { ActivityCard } from "@/components/activity/ActivityCard"
import { HomeFilters } from "@/components/home/HomeFilters"
import { MobileSearch } from "@/components/home/MobileSearch"
import { ActivityGrid } from "@/components/home/ActivityGrid"
import { Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { HeroCarousel } from "@/components/home/HeroCarousel"
import Image from "next/image"
import Link from "next/link"

export const revalidate = 60;

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
  
  try {
    const currentVertical = params.vertical || 'tour';

    let query = supabase.from('activities').select('*, categories!inner(slug), reviews(rating)')
      .eq('category_type', currentVertical)
      .eq('status', 'published');
    
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
      <section className="max-w-7xl mx-auto px-4 py-8">
        <ActivityGrid activities={activities} currentCategory={currentCategory} />
      </section>

      {/* Our Story Section */}
      <section className="bg-zinc-50 py-12 md:py-24 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-2xl md:text-5xl font-bold text-zinc-900 leading-tight">
                Our Story: Driven By Wanderlust, Powered By Experience
              </h2>
              <p className="text-zinc-600 text-lg leading-relaxed max-w-lg">
                We believe that travel is more than just visiting a new place—it's about creating lasting memories. From the hidden waterfalls to the breathtaking coastline, we provide exclusive access to authentic Sri Lankan adventures.
              </p>
              <button className="mt-4 bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-xl md:rounded-full font-semibold transition-all">
                Find More
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 h-[300px] md:h-[500px]">
              <div className="relative w-full h-full rounded-xl md:rounded-3xl overflow-hidden shadow-lg mt-4 md:mt-8 aspect-[4/3] md:aspect-auto">
                <Image src="https://images.unsplash.com/photo-1549366021-9f761d450615?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Safari" fill className="object-cover" />
              </div>
              <div className="relative w-full h-full rounded-xl md:rounded-3xl overflow-hidden shadow-lg mb-4 md:mb-8 aspect-[4/3] md:aspect-auto">
                <Image src="https://images.unsplash.com/photo-1588825121118-20d0f7a73155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Train" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Travelers Trust Us */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-24 text-center">
        <h2 className="text-4xl font-bold text-zinc-900 mb-4">Why Travelers Trust Us</h2>
        <p className="text-zinc-500 mb-16">We Deliver Every Milestone Memorably, We're Dedicated.</p>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Trusted Experience</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              We've created a memorable travel experience that cats to every traveler's unique needs.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
              <Tag className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Best Price Guarantee</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Exclusive deals with direct providers means honest discounts and clear offers.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900">Customer Satisfaction</h3>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Our glowing reviews and loyal clients speak for our dedication to delivering the best.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
