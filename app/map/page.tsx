import { InteractiveMap, MapTour } from "@/components/map/InteractiveMap"
import { supabase } from "@/lib/supabase"

export const revalidate = 0 // Opt out of caching for now to always show fresh tours

export default async function MapPage() {
  // Fetch active tours from the database
  const { data: activities, error } = await supabase
    .from('activities')
    .select('*, categories(name)')
    .eq('status', 'published')
    
  if (error) {
    console.error("Error fetching map tours:", error)
  }

  // Format data for the map
  let mapData: MapTour[] = []
  
  if (activities && activities.length > 0) {
    mapData = activities.map((activity: any) => ({
      id: activity.id,
      title: activity.title,
      location: activity.location,
      price_usd: activity.price_usd,
      cover_image_url: activity.cover_image_url,
      duration: activity.duration,
      category: activity.categories?.name || 'All',
      latitude: null, // Relies on location string fallback lookup
      longitude: null,
      rating: 4.9 // Or from reviews if available
    }))
  } else {
    // Fallback data if DB fetch fails or is empty, perfectly matching our filter bar keys
    mapData = [
      {
        id: '1', title: 'Secret Sunset Surf Lesson', 
        location: 'Hiriketiya', duration: '2 hours', price_usd: 35.00,
        cover_image_url: 'https://images.pexels.com/photos/1243337/pexels-photo-1243337.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'Surf', rating: 4.9
      },
      {
        id: '2', title: 'Ella Rock Sunrise Hike', 
        location: 'Ella', duration: '4 hours', price_usd: 45.00,
        cover_image_url: 'https://images.pexels.com/photos/347141/pexels-photo-347141.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'Hiking', rating: 4.8
      },
      {
        id: '3', title: 'Yala Leopard Safari', 
        location: 'Yala', duration: 'Half-day', price_usd: 85.00,
        cover_image_url: 'https://images.pexels.com/photos/247376/pexels-photo-247376.jpeg?auto=compress&cs=tinysrgb&w=800',
        category: 'Safaris', rating: 4.9
      }
    ]
  }

  return (
    <div className="w-full">
      <InteractiveMap tours={mapData} />
    </div>
  )
}
