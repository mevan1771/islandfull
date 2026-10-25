import { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/host",
          "/host/",
          "/api/",
          "/account",
          "/offers",
          "/offers/",
          "/sign-in",
          "/sign-up",
          "/sso-callback",
          "/booking/",
          "/trips",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
