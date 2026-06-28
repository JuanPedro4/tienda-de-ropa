import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import ImageGallery from "@/components/pdp/ImageGallery";
import ProductInfo from "@/components/pdp/ProductInfo";
import VariantSelectorWrapper from "./variant-selector-wrapper";
import Breadcrumbs from "@/components/pdp/Breadcrumbs";
import ReviewsWrapper from "./reviews-wrapper";
import { productJsonLd, breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld";
import { getProductByHandle } from "@/lib/products/product-detail";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const CATEGORY_SLUGS = new Set(["casual", "arreglada", "deporte"]);

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductByHandle(slug);

  if (!product) {
    return { title: "Producto no encontrado | Tienda Peques" };
  }

  return {
    title: `${product.title} | Tienda Peques`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: `${product.title} — Tienda Peques`,
      description: product.description.slice(0, 160),
      locale: "es_ES",
      type: "website",
      images: product.images.map((img) => ({ url: img.url })),
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} — Tienda Peques`,
      description: product.description.slice(0, 160),
      images: product.images.map((img) => ({ url: img.url })),
    },
    other: {
      "og:price:amount": String((product.variants[0]?.prices[0]?.amount ?? 0) / 100),
      "og:price:currency": product.variants[0]?.prices[0]?.currencyCode ?? "EUR",
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  if (CATEGORY_SLUGS.has(slug)) {
    redirect(`/productos?categoria=${slug}`);
  }

  const product = await getProductByHandle(slug);
  if (!product) notFound();

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
        <ImageGallery images={product.images} title={product.title} />

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

      <ReviewsWrapper productId={product.id} />

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
