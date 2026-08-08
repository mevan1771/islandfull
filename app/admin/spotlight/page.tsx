import { getGlobalSetting } from "@/app/actions/settings"
import { SpotlightClient } from "@/components/admin/SpotlightClient"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function SpotlightManagementPage() {
  let currentConfig = await getGlobalSetting('featured_spotlight')
  
  // Migrate old single object to array if needed
  if (currentConfig && !Array.isArray(currentConfig)) {
    currentConfig = [currentConfig]
  }

  if (!currentConfig || !Array.isArray(currentConfig) || currentConfig.length === 0) {
    currentConfig = [{
      id: "default-1",
      title: "Our Story: Driven By Wanderlust, Powered By Experience",
      description: "We believe that travel is more than just visiting a new place—it's about creating lasting memories. From the hidden waterfalls to the breathtaking coastline, we provide exclusive access to authentic Sri Lankan adventures.",
      image_url_1: "https://images.unsplash.com/photo-1549366021-9f761d450615?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      image_url_2: "https://images.unsplash.com/photo-1588825121118-20d0f7a73155?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      button_text: "Find More",
      target_url: ""
    }]
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
            <p className="text-zinc-500 mt-1">Manage the Featured Spotlight on the homepage.</p>
          </div>
        </div>

        <div className="flex gap-6 border-b border-zinc-200 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/admin" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Bookings</Link>
          <Link href="/admin/tours" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Tours Database</Link>
          <Link href="/admin/carousel" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Hero Carousel</Link>
          <Link href="/admin/spotlight" className="pb-3 border-b-2 border-zinc-900 font-bold text-zinc-900 px-1">Spotlight</Link>
          <Link href="/admin/reviews" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Reviews</Link>
          <Link href="/admin/promos" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Promo Codes</Link>
          <Link href="/admin/finances" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Finances</Link>
          <Link href="/admin/earnings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Earnings</Link>
          <Link href="/admin/hosts" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Hosts</Link>
          <Link href="/admin/categories" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Categories</Link>
          <Link href="/admin/settings" className="pb-3 border-b-2 border-transparent font-bold text-zinc-500 hover:text-zinc-900 transition-colors px-1">Global Settings</Link>
        </div>

        <SpotlightClient initialConfig={currentConfig} />
      </div>
    </div>
  )
}
