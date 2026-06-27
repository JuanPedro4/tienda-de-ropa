import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogPageContent from "./catalog-content";
import { getCatalogProducts } from "@/lib/products/catalog-data";
import { storeJsonLd, breadcrumbJsonLd, categoryJsonLd, JsonLd } from "@/lib/seo/json-ld";

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categoria = typeof params.categoria === "string" ? params.categoria : undefined;

  if (categoria) {
    const nombreCategoria =
      categoria === "casual"
        ? "Casual"
        : categoria === "arreglada"
          ? "Arreglada"
          : categoria === "deporte"
            ? "Deporte"
            : categoria;
    return {
      title: `Categoría ${nombreCategoria} | Tienda Peques`,
      description: `Explora nuestra colección de ropa infantil ${nombreCategoria.toLowerCase()} para niños de 0 a 14 años. Talles 50-164 cm EN 13402.`,
      openGraph: {
        title: `${nombreCategoria} — Tienda Peques`,
        description: `Ropa infantil ${nombreCategoria.toLowerCase()} de calidad. Casual, cómoda y diseñada para el día a día.`,
        locale: "es_ES",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${nombreCategoria} — Tienda Peques`,
        description: `Ropa infantil ${nombreCategoria.toLowerCase()} de calidad.`,
      },
    };
  }

  return {
    title: "Catálogo | Tienda Peques",
    description:
      "Explora nuestro catálogo completo de ropa infantil: casual, arreglada y deporte. Encuentra talles 50-164 cm con la mejor calidad para niños de 0 a 14 años.",
    openGraph: {
      title: "Catálogo — Tienda Peques",
      description:
        "Explora nuestro catálogo completo de ropa infantil: casual, arreglada y deporte.",
      locale: "es_ES",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Catálogo — Tienda Peques",
      description:
        "Explora nuestro catálogo completo de ropa infantil.",
    },
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const resolvedParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") {
      resolvedParams[key] = value;
    } else if (Array.isArray(value) && value.length > 0) {
      resolvedParams[key] = value[0]!;
    }
  }

  const categoria = typeof params.categoria === "string" ? params.categoria : undefined;

  const products = await getCatalogProducts();

  return (
    <>
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-900" />
          </div>
        }
      >
        <CatalogPageContent searchParams={resolvedParams} products={products} />
      </Suspense>

      {/* Schema.org JSON-LD */}
      {categoria ? (
        <JsonLd
          jsonLd={categoryJsonLd({
            name:
              categoria === "casual"
                ? "Casual"
                : categoria === "arreglada"
                  ? "Arreglada"
                  : "Deporte",
            handle: categoria,
          })}
        />
      ) : (
        <JsonLd jsonLd={storeJsonLd()} />
      )}
      <JsonLd
        jsonLd={breadcrumbJsonLd([
          { label: "Inicio", href: "/" },
          { label: "Productos", href: "/productos" },
        ])}
      />
    </>
  );
}
