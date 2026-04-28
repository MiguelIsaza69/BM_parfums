import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bmparfums.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/dashboard/'], // Rutas privadas que Google no debe indexar
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
