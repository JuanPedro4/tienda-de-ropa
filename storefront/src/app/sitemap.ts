import type { MetadataRoute } from "next";
import { getAllMockProducts } from "@/lib/products/mock-data";

/**
 * Generate dynamic sitemap for Tienda Peques.
 *
 * In production, replace getAllMockProducts() with a Medusa product fetch
 * that returns all published products.
 *
 * URL structure:
 * - Static pages: /, /productos, /carrito, /checkout, /login, /registro
 * - Category pages: /productos?categoria={slug}
 * - Product pages: /productos/{handle}
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://tiendapeques.com";
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0] as string;

  // ── Static pages ──
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: todayStr,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/productos`,
      lastModified: todayStr,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/carrito`,
      lastModified: todayStr,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/checkout`,
      lastModified: todayStr,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: todayStr,
      changeFrequency: "monthly",
      priority: 0.2,
    },
    {
      url: `${siteUrl}/registro`,
      lastModified: todayStr,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];

  // ── Category pages ──
  const categories = [
    { slug: "casual", priority: 0.8 },
    { slug: "arreglada", priority: 0.8 },
    { slug: "deporte", priority: 0.8 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/productos?categoria=${cat.slug}`,
    lastModified: todayStr,
    changeFrequency: "daily" as const,
    priority: cat.priority,
  }));

  // ── Product pages ──
  const products = getAllMockProducts();

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteUrl}/productos/${product.handle}`,
    lastModified: todayStr,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}

/**
 * Example: generateSitemaps() for >50k URLs.
 * Currently not needed (~10 URLs), but structure is prepared.
 *
 * export async function generateSitemaps() {
 *   const products = await getAllProductsFromDB();
 *   const chunks = Math.ceil(products.length / 50000);
 *   return Array.from({ length: chunks }, (_, i) => ({ id: i }));
 * }
 */
