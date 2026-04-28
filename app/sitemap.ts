import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const revalidate = 3600; // Revalida cada hora para mantenerlo actualizado

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Es recomendable configurar NEXT_PUBLIC_SITE_URL en Vercel con tu dominio de producción real
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bmparfums.com';

    // Rutas estáticas principales
    const staticRoutes = [
        '',
        '/catalogo',
        '/categorias',
        '/marcas',
        '/contacto',
        '/registrarse',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // Rutas dinámicas de productos
    let productRoutes: MetadataRoute.Sitemap = [];

    try {
        const { data: products } = await supabase
            .from('products')
            .select('id, created_at');

        if (products) {
            productRoutes = products.map((product) => ({
                url: `${baseUrl}/product/${product.id}`,
                lastModified: product.created_at ? new Date(product.created_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.6,
            }));
        }
    } catch (error) {
        console.error("Error fetching products for sitemap:", error);
    }

    return [...staticRoutes, ...productRoutes];
}
