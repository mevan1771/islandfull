import { InteractiveMap, MapTour } from "@/components/map/InteractiveMap"
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

  // Fetch active tours from the database
  let activitiesQuery = supabase
    .from('activities')
    .select('*, categories(name, slug), activity_categories(categories(slug)), reviews(rating), users(full_name)')
    .eq('status', 'published')
    
  if (currentVertical !== 'all') {
    activitiesQuery = activitiesQuery.eq('category_type', currentVertical)
  }

  const { data: activities, error } = await activitiesQuery
    
  if (error) {
    console.error("Error fetching map tours:", error)
  }

  // Format data for the map
  let mapData: MapTour[] = []
  
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
        hostName: activity.users?.full_name,
        price_usd: activity.price_usd,
        cover_image_url: activity.cover_image_url,
        duration: activity.duration,
        category: activity.categories?.slug || tags[0] || 'all', // Fallback to first tag or all
        category_type: activity.category_type || 'tour',
        latitude: null, // Relies on location string fallback lookup
        longitude: null,
        rating: Number(rating.toFixed(1)),
        reviewCount,
        tags
      }
    })
  } else {
    // Fallback data if DB fetch fails or is empty, perfectly matching our filter bar keys
    mapData = [
      {
        id: '1', title: 'Secret Sunset Surf Lesson', 
        location: 'Hiriketiya', duration: '2 hours', price_usd: 35.00,
        cover_image_url: 'https://images.pexels.com/photos/1243337/pexels-photo-1243337.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'surf', category_type: 'tour', rating: 4.9
      },
      {
        id: '2', title: 'Ella Rock Sunrise Hike', 
        location: 'Ella', duration: '4 hours', price_usd: 45.00,
        cover_image_url: 'https://images.pexels.com/photos/347141/pexels-photo-347141.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'hiking', category_type: 'tour', rating: 4.8
      },
      {
        id: '3', title: 'Yala Leopard Safari', 
        location: 'Yala', duration: 'Half-day', price_usd: 85.00,
        cover_image_url: 'https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'safaris', category_type: 'tour', rating: 4.9
      }
    ]
  }

  return (
    <div className="w-full">
      <InteractiveMap tours={mapData} dynamicCategories={dynamicCategories} currentVertical={currentVertical} />
    </div>
  )
}
