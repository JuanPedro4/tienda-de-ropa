// ──────────────────────────────────────────────
// Mock product data for development
// Will be replaced by Medusa product queries
// ──────────────────────────────────────────────

const MOCK_PRODUCTS: Record<
  string,
  {
    id: string;
    title: string;
    handle: string;
    thumbnail: string | null;
    variants: {
      id: string;
      sku: string;
      title: string;
      prices: { amount: number; currencyCode: string }[];
      inventoryQuantity: number;
    }[];
    categories: { name: string; handle: string }[];
  }
> = {
  "prod-mock-1": {
    id: "prod-mock-1",
    title: "Camiseta de algodón orgánico",
    handle: "camiseta-algodon-organico",
    thumbnail: null,
    variants: [
      {
        id: "var-size-92",
        sku: "CAM-ORG-092",
        title: "92",
        prices: [{ amount: 2490, currencyCode: "EUR" }],
        inventoryQuantity: 15,
      },
      {
        id: "var-size-104",
        sku: "CAM-ORG-104",
        title: "104",
        prices: [{ amount: 2690, currencyCode: "EUR" }],
        inventoryQuantity: 8,
      },
      {
        id: "var-size-116",
        sku: "CAM-ORG-116",
        title: "116",
        prices: [{ amount: 2990, currencyCode: "EUR" }],
        inventoryQuantity: 0,
      },
      {
        id: "var-size-128",
        sku: "CAM-ORG-128",
        title: "128",
        prices: [{ amount: 3190, currencyCode: "EUR" }],
        inventoryQuantity: 3,
      },
    ],
    categories: [{ name: "Casual", handle: "casual" }],
  },
  "prod-mock-2": {
    id: "prod-mock-2",
    title: "Pantalón deportivo",
    handle: "pantalon-deportivo",
    thumbnail: null,
    variants: [
      {
        id: "var-sport-92",
        sku: "PAN-DEP-092",
        title: "92",
        prices: [{ amount: 2990, currencyCode: "EUR" }],
        inventoryQuantity: 10,
      },
      {
        id: "var-sport-104",
        sku: "PAN-DEP-104",
        title: "104",
        prices: [{ amount: 3290, currencyCode: "EUR" }],
        inventoryQuantity: 5,
      },
    ],
    categories: [{ name: "Deporte", handle: "deporte" }],
  },
  "prod-mock-3": {
    id: "prod-mock-3",
    title: "Vestido floral primavera",
    handle: "vestido-floral-primavera",
    thumbnail: null,
    variants: [
      {
        id: "var-formal-92",
        sku: "VES-FLO-092",
        title: "92",
        prices: [{ amount: 3490, currencyCode: "EUR" }],
        inventoryQuantity: 0,
      },
      {
        id: "var-formal-104",
        sku: "VES-FLO-104",
        title: "104",
        prices: [{ amount: 3790, currencyCode: "EUR" }],
        inventoryQuantity: 7,
      },
    ],
    categories: [{ name: "Arreglada", handle: "formal" }],
  },
};

/**
 * Get product data by ID. Returns null if not found.
 * TODO: Replace with Medusa product query when Medusa backend is active.
 */
export function getMockProductById(productId: string) {
  return MOCK_PRODUCTS[productId] ?? null;
}

/**
 * Get all mock products.
 * TODO: Replace with Medusa product query when Medusa backend is active.
 */
export function getAllMockProducts() {
  return Object.values(MOCK_PRODUCTS);
}
