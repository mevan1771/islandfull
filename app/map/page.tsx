import { MapClientWrapper } from "@/components/map/MapClientWrapper"
import type { MapTour } from "@/components/map/InteractiveMap"
import { supabase } from "@/lib/supabase"

export const revalidate = 0 // Opt out of caching for now to always show fresh tours

export default async function MapPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const params = await searchParams;
  const currentVertical = params.vertical || 'all';

  // Fetch dynamic categories
  let dynamicCategories: any[] = []
  let catQuery = supabase
    .from('categories')
    .select('name, slug, category_type')
    .order('sort_order', { ascending: true })
    .order('name')

  if (currentVertical !== 'all') {
    catQuery = catQuery.eq('category_type', currentVertical)
  }

  const { data: catData, error: catError } = await catQuery

  if (!catError && catData) {
    dynamicCategories = catData
  }

  let mapData: MapTour[] = []

  if (currentVertical !== 'hotel') {
    let activitiesQuery = supabase
      .from('activities')
      .select('id, title, slug, location, description, inclusions, provider_name, price_usd, cover_image_url, duration, category_type, approx_lat, approx_lng, categories(name, slug), activity_categories(categories(slug)), reviews(rating)')
      .eq('status', 'published')
      .neq('category_type', 'event')

    if (currentVertical !== 'all') {
      activitiesQuery = activitiesQuery.eq('category_type', currentVertical)
    }

    const { data: activities, error } = await activitiesQuery

    if (error) {
      console.error("Error fetching map tours:", error)
    }

    if (activities && activities.length > 0) {
      mapData = activities.map((activity: any) => {
        let rating = 4.9;
        let reviewCount = 0;
        if (activity.reviews && activity.reviews.length > 0) {
          rating = activity.reviews.reduce((acc: number, rev: any) => acc + rev.rating, 0) / activity.reviews.length;
          reviewCount = activity.reviews.length;
        }

        const tags = Array.isArray(activity.categories)
          ? activity.categories.map((c: any) => c.slug)
          : (activity.categories?.slug ? [activity.categories.slug] : []);

        return {
          id: activity.id,
          title: activity.title,
          slug: activity.slug,
          location: activity.location,
          description: activity.description,
          inclusions: activity.inclusions,
          hostName: activity.provider_name,
          price_usd: activity.price_usd,
          cover_image_url: activity.cover_image_url,
          duration: activity.duration,
          category: activity.categories?.slug || tags[0] || 'all',
          category_type: activity.category_type || 'tour',
          latitude: activity.approx_lat ? parseFloat(activity.approx_lat) : null,
          longitude: activity.approx_lng ? parseFloat(activity.approx_lng) : null,
          rating: Number(rating.toFixed(1)),
          reviewCount,
          tags,
          listingHref: `/activity/${activity.slug}`,
        }
      })
    }
  }

  if (currentVertical === 'all' || currentVertical === 'hotel') {
    const { data: hotels, error: hotelsError } = await supabase
      .from('hotels')
      .select('id, title, slug, location, description, cover_image_url, latitude, longitude, hotel_room_types(nightly_rate_usd, is_active)')
      .eq('status', 'published')
      .eq('is_paused', false)

    if (hotelsError) {
      console.error("Error fetching map hotels:", hotelsError)
    } else if (hotels?.length) {
      mapData = mapData.concat(hotels.map((hotel: any) => {
        const rates = (hotel.hotel_room_types || [])
          .filter((room: any) => room.is_active)
          .map((room: any) => Number(room.nightly_rate_usd) || 0)
        return {
          id: hotel.id,
          title: hotel.title,
          slug: hotel.slug,
          location: hotel.location || '',
          description: hotel.description,
          hostName: undefined,
          price_usd: rates.length ? Math.min(...rates) : 0,
          cover_image_url: hotel.cover_image_url,
          duration: 'night',
          category: 'hotel',
          category_type: 'hotel',
          latitude: hotel.latitude != null ? Number(hotel.latitude) : null,
          longitude: hotel.longitude != null ? Number(hotel.longitude) : null,
          tags: ['hotel'],
          listingHref: `/hotel/${hotel.slug}`,
        }
      }))
    }
  }

  return (
    <div className="relative w-full h-dvh max-h-dvh overflow-hidden">
      <MapClientWrapper tours={mapData} dynamicCategories={dynamicCategories} currentVertical={currentVertical} />
    </div>
  )
}
