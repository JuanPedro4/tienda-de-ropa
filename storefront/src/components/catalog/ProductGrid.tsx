import ProductCard from "./ProductCard";

interface ProductGridProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
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

interface ProductGridProps {
  products: ProductGridProduct[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <svg
          className="mb-4 h-12 w-12 text-brand-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-sm font-medium text-brand-900">
          No encontramos productos
        </h3>
        <p className="mt-1 text-xs text-brand-400">
          Prob&aacute; con otros filtros o t&eacute;rminos de b&uacute;squeda.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
