import { MetadataRoute } from "next"
import { createClient } from "@supabase/supabase-js"
import { SITE_URL } from "@/lib/seo"
import { TRANSPORT_ROUTES } from "@/lib/transport-seo"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/transport`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE_URL}/transport/plan`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/transport/getting-around-sri-lanka`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/transport/private-driver`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/transport/airport-transfers`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/transport/routes`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    ...TRANSPORT_ROUTES.map((route) => ({
      url: `${SITE_URL}/transport/routes/${route.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/destinations`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/map`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/help`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/legal`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/cancellation-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/list-your-tour`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ]

  const [{ data: activities }, hotelsRes] = await Promise.all([
    supabase.from("activities").select("slug, updated_at").eq("status", "published").eq("is_paused_by_host", false),
    supabase.from("hotels").select("slug, updated_at").eq("status", "published"),
  ])
  const hotels = hotelsRes.data

  const activityRoutes: MetadataRoute.Sitemap = (activities || []).map((activity) => ({
    url: `${SITE_URL}/activity/${activity.slug}`,
    lastModified: new Date(activity.updated_at || now),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  const hotelRoutes: MetadataRoute.Sitemap = (hotels || []).map((hotel) => ({
    url: `${SITE_URL}/hotel/${hotel.slug}`,
    lastModified: new Date(hotel.updated_at || now),
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticRoutes, ...activityRoutes, ...hotelRoutes]
}
