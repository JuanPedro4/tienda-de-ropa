/**
 * Catalog filter types for multi-axis product filtering.
 *
 * These types define the frontend filter model that gets mapped
 * to Medusa GraphQL query parameters.
 */

export type CategorySlug = "casual" | "arreglada" | "deporte";

export type GenderFilter = "nino" | "nina" | "unisex" | null;

export interface PriceRange {
  min: number | null;
  max: number | null;
}

export interface AgeRange {
  min: number; // 0-14
  max: number; // 0-14
}

export interface ProductFilters {
  category: CategorySlug | null;
  search: string | null;
  gender: GenderFilter;
  price: PriceRange;
  age: AgeRange;
  size: string | null;
}

export const DEFAULT_AGE_RANGE: AgeRange = { min: 0, max: 14 };

export const DEFAULT_PRICE_RANGE: PriceRange = { min: null, max: null };

export const DEFAULT_FILTERS: ProductFilters = {
  category: null,
  search: null,
  gender: null,
  price: DEFAULT_PRICE_RANGE,
  age: DEFAULT_AGE_RANGE,
  size: null,
};

/**
 * Sort options for the catalog.
 */
export type SortOption = "price-asc" | "price-desc" | "name-asc" | "name-desc" | "newest" | "vistos";

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Novedades" },
  { value: "vistos", label: "Más vistos" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "name-asc", label: "Nombre A-Z" },
  { value: "name-desc", label: "Nombre Z-A" },
];

/**
 * Map EN 13402 height ranges to age labels for filter display.
 */
export const AGE_FILTER_OPTIONS = [
  { label: "0-3 meses", heightMin: 50, heightMax: 62 },
  { label: "3-12 meses", heightMin: 62, heightMax: 80 },
  { label: "12-24 meses", heightMin: 80, heightMax: 92 },
  { label: "2-3 años", heightMin: 92, heightMax: 98 },
  { label: "3-5 años", heightMin: 98, heightMax: 110 },
  { label: "5-7 años", heightMin: 110, heightMax: 122 },
  { label: "7-9 años", heightMin: 122, heightMax: 134 },
  { label: "9-11 años", heightMin: 134, heightMax: 146 },
  { label: "11-14 años", heightMin: 146, heightMax: 164 },
] as const;

/**
 * Available sizes from EN 13402.
 */
export const EN13402_SIZES = [
  "50", "56", "62", "68", "74", "80", "86",
  "92", "98", "104", "110", "116", "122",
  "128", "134", "140", "146", "152", "158", "164",
] as const;
