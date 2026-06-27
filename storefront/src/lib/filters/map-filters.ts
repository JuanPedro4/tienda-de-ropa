/**
 * Maps frontend filter state to Medusa GraphQL query variables.
 *
 * The frontend uses human-friendly filter names (casual, arreglada, deporte)
 * while Medusa uses category IDs or handles from its category tree.
 */

import type { ProductFilters, SortOption } from "./types";

export interface MedusaProductVariables {
  categoryId?: string;
  search?: string;
  cursor?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  priceGte?: number;
  priceLte?: number;
}

/**
 * Category slug mapping from frontend to Medusa handles.
 */
const CATEGORY_HANDLE_MAP: Record<string, string> = {
  casual: "casual",
  arreglada: "formal",
  deporte: "sport",
};

/**
 * Map frontend category slug to Medusa category handle.
 */
export function mapCategoryToHandle(slug: string): string {
  return CATEGORY_HANDLE_MAP[slug] ?? slug;
}

/**
 * Map frontend category slug back from Medusa handle.
 */
export function mapHandleToCategory(handle: string): string {
  const entry = Object.entries(CATEGORY_HANDLE_MAP).find(
    ([, v]) => v === handle,
  );
  return entry?.[0] ?? handle;
}

/**
 * Map frontend sort option to Medusa sort parameter.
 */
function mapSortOption(sort: SortOption): string | undefined {
  switch (sort) {
    case "price-asc":
      return "price:asc";
    case "price-desc":
      return "price:desc";
    case "name-asc":
      return "title:asc";
    case "name-desc":
      return "title:desc";
    case "newest":
      return "created_at:desc";
    default:
      return undefined;
  }
}

/**
 * Transform frontend ProductFilters to Medusa query variables.
 */
export function filtersToMedusaVariables(
  filters: ProductFilters,
  options?: {
    cursor?: string;
    offset?: number;
    limit?: number;
    sort?: SortOption;
  },
): MedusaProductVariables {
  const vars: MedusaProductVariables = {
    limit: options?.limit ?? 20,
  };

  if (filters.category) {
    vars.categoryId = mapCategoryToHandle(filters.category);
  }

  if (filters.search) {
    vars.search = filters.search;
  }

  if (options?.cursor) {
    vars.cursor = options.cursor;
  }

  if (options?.offset !== undefined) {
    vars.offset = options.offset;
  }

  if (options?.sort) {
    const mapped = mapSortOption(options.sort);
    if (mapped) vars.sortBy = mapped;
  }

  if (filters.price.min !== null) {
    vars.priceGte = filters.price.min;
  }

  if (filters.price.max !== null) {
    vars.priceLte = filters.price.max;
  }

  return vars;
}

/**
 * Parse URL search params into ProductFilters.
 */
export function parseSearchParams(
  searchParams: URLSearchParams,
): ProductFilters {
  const category = searchParams.get("categoria") as ProductFilters["category"];
  const gender = searchParams.get("genero") as ProductFilters["gender"];
  const size = searchParams.get("talle");
  const search = searchParams.get("q");
  const priceMin = searchParams.get("precio_min");
  const priceMax = searchParams.get("precio_max");
  const ageMin = searchParams.get("edad_min");
  const ageMax = searchParams.get("edad_max");

  return {
    category: category && ["casual", "arreglada", "deporte"].includes(category)
      ? category
      : null,
    search: search || null,
    gender: gender && ["nino", "nina", "unisex"].includes(gender)
      ? gender
      : null,
    price: {
      min: priceMin ? Number(priceMin) : null,
      max: priceMax ? Number(priceMax) : null,
    },
    age: {
      min: ageMin ? Number(ageMin) : 0,
      max: ageMax ? Number(ageMax) : 14,
    },
    size: size || null,
  };
}

/**
 * Build URL search params string from ProductFilters.
 */
export function filtersToSearchParams(filters: ProductFilters): string {
  const params = new URLSearchParams();

  if (filters.category) params.set("categoria", filters.category);
  if (filters.search) params.set("q", filters.search);
  if (filters.gender) params.set("genero", filters.gender);
  if (filters.price.min !== null) params.set("precio_min", String(filters.price.min));
  if (filters.price.max !== null) params.set("precio_max", String(filters.price.max));
  if (filters.age.min > 0) params.set("edad_min", String(filters.age.min));
  if (filters.age.max < 14) params.set("edad_max", String(filters.age.max));
  if (filters.size) params.set("talle", filters.size);

  return params.toString();
}
