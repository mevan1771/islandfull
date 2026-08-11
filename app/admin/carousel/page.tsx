import { supabase, supabaseAdmin } from "@/lib/supabase"
import { CarouselClient } from "@/components/admin/CarouselClient"
import { IntroSlideConfig } from "@/components/admin/IntroSlideConfig"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function CarouselManagementPage() {
  const { data: featured } = await supabase
    .from('activities')
    .select('id, title, is_featured, featured_order, cover_image_url')
    .eq('is_featured', true)
    .order('featured_order', { ascending: true })
    
  const { data: allTours } = await supabase
    .from('activities')
    .select('id, title, cover_image_url')
    .eq('status', 'published')
    .order('title', { ascending: true })

  const { data: introSetting } = await supabaseAdmin
    .from('global_settings')
    .select('value')
    .eq('key', 'hero_intro_slide')
    .single()

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Operations</h1>
            <p className="text-zinc-500 mt-1">Manage which tours appear on the homepage and their order.</p>
          </div>
        </div>

        

        <div className="space-y-6">
          <IntroSlideConfig initialData={introSetting?.value || null} />
          <CarouselClient initialTours={featured || []} allTours={allTours || []} />
        </div>
        
      </div>
    </div>
  )
}

