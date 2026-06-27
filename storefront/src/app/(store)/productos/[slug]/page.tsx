import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ImageGallery from "@/components/pdp/ImageGallery";
import ProductInfo from "@/components/pdp/ProductInfo";
import VariantSelectorWrapper from "./variant-selector-wrapper";
import Breadcrumbs from "@/components/pdp/Breadcrumbs";
import ReviewsWrapper from "./reviews-wrapper";
import { productJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// ─── Mock product data for development ───────────────────────
const MOCK_PRODUCT = {
  id: "prod-mock-1",
  title: "Camiseta de algodón orgánico",
  subtitle: "Suave, transpirable y cómoda para el día a día",
  handle: "camiseta-algodon-organico",
  description:
    "Camiseta infantil confeccionada en algodón orgánico certificado GOTS. Diseñada para ofrecer la máxima comodidad durante todo el día.\n\n• Algodón 100% orgánico\n• Tejido de punto suave\n• Costuras reforzadas\n• Etiqueta sin roce\n• Teñido con colorantes libres de químicos",
  material: "100% Algodón orgánico certificado GOTS",
  originCountry: "España",
  thumbnail: null,
  images: [] as { url: string; alt: string | null }[],
  variants: [
    {
      id: "var-size-92",
      sku: "CAM-ORG-092",
      title: "92",
      inventoryQuantity: 15,
      allowBackorder: false,
      options: [{ name: "Talle", value: "92" }],
      prices: [{ amount: 2490, currencyCode: "EUR" }],
    },
    {
      id: "var-size-104",
      sku: "CAM-ORG-104",
      title: "104",
      inventoryQuantity: 8,
      allowBackorder: false,
      options: [{ name: "Talle", value: "104" }],
      prices: [{ amount: 2690, currencyCode: "EUR" }],
    },
    {
      id: "var-size-116",
      sku: "CAM-ORG-116",
      title: "116",
      inventoryQuantity: 0,
      allowBackorder: false,
      options: [{ name: "Talle", value: "116" }],
      prices: [{ amount: 2990, currencyCode: "EUR" }],
    },
    {
      id: "var-size-128",
      sku: "CAM-ORG-128",
      title: "128",
      inventoryQuantity: 3,
      allowBackorder: false,
      options: [{ name: "Talle", value: "128" }],
      prices: [{ amount: 3190, currencyCode: "EUR" }],
    },
  ],
  categories: [{ id: "cat-1", name: "Casual", handle: "casual" }],
  certifications: [
    { name: "GOTS", badge: undefined },
    { name: "OEKO-TEX Standard 100", badge: undefined },
  ],
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  await params;

  // In production, fetch product by handle from Medusa
  const productTitle = "Camiseta de algodón orgánico";
  const productDescription =
    "Camiseta infantil de algodón orgánico certificado GOTS. Suave, transpirable y cómoda. Talles 92-128 cm.";
  const productPrice = 2490;
  const priceCurrency = "EUR";

  return {
    title: `${productTitle} | Tienda Peques`,
    description: productDescription,
    openGraph: {
      title: `${productTitle} — Tienda Peques`,
      description: productDescription,
      locale: "es_ES",
      type: "website",
      images: [],
      // og:price:amount and og:price:currency via other metadata
    },
    twitter: {
      card: "summary_large_image",
      title: `${productTitle} — Tienda Peques`,
      description: productDescription,
      images: [],
    },
    other: {
      "og:price:amount": String(productPrice / 100),
      "og:price:currency": priceCurrency,
    },
  };
}

const CATEGORY_SLUGS = new Set(["casual", "arreglada", "deporte"]);

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  // If slug matches a category, redirect to catalog with filter
  if (CATEGORY_SLUGS.has(slug)) {
    redirect(`/productos?categoria=${slug}`);
  }

  // In production, fetch product by handle from Medusa:
  // const { data, errors } = await medusaQuery(PRODUCT_BY_HANDLE_QUERY, { handle: slug });
  // if (errors || !data?.product) notFound();
  // const product = data.product;

  if (!slug) notFound();

  const product = MOCK_PRODUCT;

  const category = product.categories[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Breadcrumbs
        items={[
          { label: "Productos", href: "/productos" },
          ...(category
            ? [
                {
                  label: category.name,
                  href: `/productos/${category.handle === "formal" ? "arreglada" : category.handle}`,
                },
              ]
            : []),
          { label: product.title },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Image gallery */}
        <ImageGallery images={product.images} title={product.title} />

        {/* Right: Product info and actions */}
        <div>
          <ProductInfo product={product} />
          <div className="mt-6 space-y-4">
            <VariantSelectorWrapper
              variants={product.variants}
              productId={product.id}
              productTitle={product.title}
              productImage={product.images[0]?.url ?? undefined}
            />
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <ReviewsWrapper productId={product.id} />

      {/* Schema.org JSON-LD */}
      <JsonLd jsonLd={productJsonLd(product)} />
      <JsonLd
        jsonLd={breadcrumbJsonLd([
          { label: "Productos", href: "/productos" },
          ...(category
            ? [
                {
                  label: category.name,
                  href: `/productos/${category.handle === "formal" ? "arreglada" : category.handle}`,
                },
              ]
            : []),
          { label: product.title, href: `/productos/${product.handle}` },
        ])}
      />
    </div>
  );
}
