"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import FilterSidebar from "@/components/catalog/FilterSidebar";
import ProductGrid from "@/components/catalog/ProductGrid";
import SearchBar from "@/components/catalog/SearchBar";
import ActiveFilters from "@/components/catalog/ActiveFilters";
import { SORT_OPTIONS, type SortOption } from "@/lib/filters/types";

interface CatalogProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  ageRange: string | null;
  views: number;
  variants: {
    id: string;
    title: string;
    sku: string;
    price: number;
    currency: string;
    inventoryQuantity: number;
  }[];
  category: { name: string; handle: string } | null;
}

interface CatalogPageContentProps {
  searchParams: Record<string, string>;
  products: CatalogProduct[];
}

const CATEGORY_HANDLE_MAP: Record<string, string> = {
  casual: "casual",
  arreglada: "formal",
  deporte: "sport",
};

export default function CatalogPageContent({
  searchParams,
  products,
}: CatalogPageContentProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>((searchParams.sort as SortOption) || "newest");
  const router = useRouter();

  const handleSortChange = useCallback(
    (newSort: SortOption) => {
      setSort(newSort);
      const params = new URLSearchParams(searchParams);
      params.set("sort", newSort);
      router.replace(`/productos?${params.toString()}`);
    },
    [router, searchParams],
  );

  const filteredProducts = useMemo(() => {
    const category = searchParams.categoria;
    const query = searchParams.q?.toLowerCase();
    const priceMin = searchParams.precio_min ? Number(searchParams.precio_min) : null;
    const priceMax = searchParams.precio_max ? Number(searchParams.precio_max) : null;
    const size = searchParams.talle;
    const edad = searchParams.edad;

    return products.filter((p) => {
      if (category) {
        const dbHandle = CATEGORY_HANDLE_MAP[category];
        if (dbHandle && p.category?.handle !== dbHandle) return false;
      }

      if (query && !p.title.toLowerCase().includes(query)) return false;

      if (edad) {
        if (p.ageRange !== edad) return false;
      }

      if (size) {
        const hasSize = p.variants.some((v) => v.title === size);
        if (!hasSize) return false;
      }

      if (priceMin !== null || priceMax !== null) {
        const minPrice = Math.min(...p.variants.map((v) => v.price ?? Infinity));
        if (priceMin !== null && minPrice < priceMin * 100) return false;
        if (priceMax !== null && minPrice > priceMax * 100) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sort === "vistos") return b.views - a.views;
      if (sort === "price-asc") {
        const aMin = Math.min(...a.variants.map((v) => v.price ?? Infinity));
        const bMin = Math.min(...b.variants.map((v) => v.price ?? Infinity));
        return aMin - bMin;
      }
      if (sort === "price-desc") {
        const aMin = Math.min(...a.variants.map((v) => v.price ?? Infinity));
        const bMin = Math.min(...b.variants.map((v) => v.price ?? Infinity));
        return bMin - aMin;
      }
      return 0;
    });
  }, [products, searchParams, sort]);

  const totalResults = filteredProducts.length;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-brand-900">
          {searchParams.categoria
            ? `${
                searchParams.categoria === "casual"
                  ? "Casual"
                  : searchParams.categoria === "arreglada"
                    ? "Arreglada"
                    : "Deporte"
              }`
            : "Todos los productos"}
        </h1>
        <p className="mt-1 text-xs text-brand-400">
          {totalResults} producto{totalResults !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 border border-brand-200 px-3 py-2 text-xs font-medium uppercase tracking-wider text-brand-600 transition hover:bg-surface lg:hidden"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filtros
          </button>

          <div className="w-full sm:w-72">
            <SearchBar />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs text-brand-400">
            Ordenar por:
          </label>
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => handleSortChange(e.target.value as SortOption)}
            className="border border-brand-200 px-3 py-2 text-xs uppercase tracking-wider text-brand-600 focus:border-brand-400 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-8">
        <FilterSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <ActiveFilters />
          <ProductGrid products={filteredProducts} />
        </div>
      </div>
    </div>
  );
}
