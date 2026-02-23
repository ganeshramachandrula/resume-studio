import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/generate/',
        '/documents/',
        '/job-tracker/',
        '/settings/',
        '/career-coach/',
        '/job-feed/',
        '/job-sites/',
        '/vault/',
        '/support/',
        '/upgrade/',
        '/admin/',
        '/country-resume/',
        '/cost-of-living/',
        '/analytics/',
        '/skill-gap/',
        '/market-insights/',
      ],
    },
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  }
}
