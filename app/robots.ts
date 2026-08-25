import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/tours', '/destinations', '/activity/*'],
            disallow: ['/admin', '/host', '/api'],
        },
        sitemap: 'https://islandfull.com/sitemap.xml',
    }
}
