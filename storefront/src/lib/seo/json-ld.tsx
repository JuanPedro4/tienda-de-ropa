// ──────────────────────────────────────────────
// Schema.org JSON-LD helpers
// ──────────────────────────────────────────────

/**
 * Product interface matching the mock/inline product data structure.
 * In production, replace with Medusa product type.
 */
interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  handle: string;
  thumbnail?: string | null;
  images?: { url: string; alt: string | null }[];
  variants?: {
    id: string;
    sku?: string;
    title: string;
    prices: { amount: number; currencyCode: string }[];
    inventoryQuantity: number;
    allowBackorder?: boolean;
  }[];
  categories?: { id: string; name: string; handle: string }[];
  material?: string;
  originCountry?: string;
}

/**
 * Breadcrumb item for breadcrumbJsonLd.
 */
interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Category interface for categoryJsonLd.
 */
interface Category {
  name: string;
  handle: string;
  description?: string;
  image?: string | null;
}

/**
 * Generate Schema.org/Product JSON-LD.
 *
 * @param product - Product data (from mock or Medusa)
 * @param averageRating - Optional aggregate rating (0-5)
 * @param reviewCount - Optional number of reviews
 * @returns JSON-LD string for <script type="application/ld+json">
 */
export function productJsonLd(
  product: Product,
  averageRating?: number,
  reviewCount?: number,
): string {
  const lowestPrice = product.variants?.reduce(
    (min, v) => {
      const price = v.prices[0]?.amount ?? 0;
      return price < min.amount ? { amount: price, currency: v.prices[0]?.currencyCode ?? "EUR" } : min;
    },
    { amount: Infinity, currency: "EUR" },
  );

  const highestPrice = product.variants?.reduce(
    (max, v) => {
      const price = v.prices[0]?.amount ?? 0;
      return price > max.amount ? { amount: price, currency: v.prices[0]?.currencyCode ?? "EUR" } : max;
    },
    { amount: 0, currency: "EUR" },
  );

  const inStock = product.variants?.some((v) => v.inventoryQuantity > 0) ?? false;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.description?.split("\n")[0]?.trim() ?? product.subtitle ?? "",
    brand: {
      "@type": "Brand",
      name: "Tienda Peques",
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: lowestPrice?.currency ?? "EUR",
      lowPrice: lowestPrice?.amount ? (lowestPrice.amount / 100).toFixed(2) : undefined,
      highPrice: highestPrice?.amount ? (highestPrice.amount / 100).toFixed(2) : undefined,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Tienda Peques",
      },
    },
  };

  // Add product URL
  if (product.handle) {
    schema.url = `https://tiendapeques.com/productos/${product.handle}`;
  }

  // Add SKU from first variant
  if (product.variants?.[0]?.sku) {
    schema.sku = product.variants[0].sku;
  }

  // Add material
  if (product.material) {
    schema.material = product.material;
  }

  // Add country of origin
  if (product.originCountry) {
    schema.countryOfOrigin = product.originCountry;
  }

  // Add images
  if (product.thumbnail) {
    schema.image = product.thumbnail;
  } else if (product.images?.length && product.images[0]?.url) {
    schema.image = product.images[0].url;
  }

  // Add aggregate rating if reviews exist
  if (averageRating !== undefined && reviewCount !== undefined && reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  // Add category
  if (product.categories?.length) {
    schema.category = product.categories[0]!.name;
  }

  return JSON.stringify(schema);
}

/**
 * Generate Schema.org/BreadcrumbList JSON-LD.
 *
 * @param items - Array of { label, href } breadcrumb items
 * @returns JSON-LD string for <script type="application/ld+json">
 */
export function breadcrumbJsonLd(items: BreadcrumbItem[]): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `https://tiendapeques.com${item.href}`,
    })),
  };

  return JSON.stringify(schema);
}

/**
 * Generate Schema.org/Store JSON-LD.
 *
 * @returns JSON-LD string with store information
 */
export function storeJsonLd(): string {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Tienda Peques",
    description:
      "Tienda de ropa infantil para niños de 0 a 14 años. Casual, arreglada y deporte en talles 50-164 cm EN 13402.",
    url: "https://tiendapeques.com",
    telephone: "+34 900 123 456",
    email: "hola@tiendapeques.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Madrid",
      addressRegion: "Madrid",
      addressCountry: "ES",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
        ],
        opens: "10:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "14:00",
      },
    ],
    sameAs: [
      "https://www.instagram.com/tiendapeques",
      "https://www.facebook.com/tiendapeques",
    ],
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Ropa infantil",
        description:
          "Ropa para niños de 0 a 14 años en talles 50-164 cm.",
      },
    },
  };

  return JSON.stringify(schema);
}

/**
 * Generate Schema.org/CollectionPage JSON-LD for a product category.
 *
 * @param category - Category information
 * @returns JSON-LD string for <script type="application/ld+json">
 */
export function categoryJsonLd(category: Category): string {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Ropa infantil ${category.name.toLowerCase()}`,
    description:
      category.description ??
      `Explora nuestra colección de ropa infantil ${category.name.toLowerCase()} en Tienda Peques.`,
    url: `https://tiendapeques.com/productos?categoria=${category.handle}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: [],
      numberOfItems: 0,
    },
  };

  if (category.image) {
    schema.image = category.image;
  }

  return JSON.stringify(schema);
}

/**
 * Render a JSON-LD script tag with the given structured data string.
 *
 * @param jsonLd - The JSON-LD string to embed
 * @returns JSX element for the script tag
 */
export function JsonLd({ jsonLd }: { jsonLd: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonLd }}
    />
  );
}
