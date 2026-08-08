import { InteractiveMap, MapTour } from "@/components/map/InteractiveMap"
import { supabase } from "@/lib/supabase"

export const revalidate = 0 // Opt out of caching for now to always show fresh tours

export default async function MapPage() {
  // Fetch active tours from the database
  const { data: tours, error } = await supabase
    .from('tours')
    .select('id, title, location, price_usd, cover_image_url, duration, category, latitude, longitude, rating')
    .eq('is_active', true)
    
  if (error) {
    console.error("Error fetching map tours:", error)
  }

  // Fallback data if DB fetch fails or is empty, similar to homepage
  const mapData: MapTour[] = (tours && tours.length > 0) ? tours : [
    {
      id: '1', title: 'Secret Sunset Surf Lesson', 
      location: 'Hiriketiya', duration: '2 hours', price_usd: 35.00,
      cover_image_url: 'https://images.pexels.com/photos/1243337/pexels-photo-1243337.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'Water', rating: 4.9
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
      category: 'Safari', rating: 4.9
    }
  ]

  return (
    <div className="w-full">
      <InteractiveMap tours={mapData} />
    </div>
  )
}
