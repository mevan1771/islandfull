import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://islandfull.com'

    // Static routes
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about-us`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/destinations`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/map`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/trips`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
    ]

    // Fetch all active/published activities
    const { data: activities } = await supabase
        .from('activities')
        .select('slug, updated_at')
        .eq('status', 'published')
        .eq('is_paused_by_host', false)

    const dynamicRoutes: MetadataRoute.Sitemap = (activities || []).map((activity) => ({
        url: `${baseUrl}/activity/${activity.slug}`,
        lastModified: new Date(activity.updated_at || new Date()),
        changeFrequency: 'daily',
        priority: 0.9,
    }))

    return [...staticRoutes, ...dynamicRoutes]
}
