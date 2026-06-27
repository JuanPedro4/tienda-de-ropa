"use client";

import Link from "next/link";
import WishlistButton from "./WishlistButton";
import { useState } from "react";

interface ProductCardProduct {
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

interface ProductCardProps {
  product: ProductCardProduct;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function getMinPrice(variants: ProductCardProduct["variants"]): {
  amount: number;
  currency: string;
} | null {
  if (variants.length === 0) return null;
  return variants.reduce((min, v) => {
    if (!v.price) return min;
    return !min || v.price < min.amount
      ? { amount: v.price, currency: v.currency }
      : min;
  }, null as { amount: number; currency: string } | null);
}

export default function ProductCard({ product }: ProductCardProps) {
  const minPrice = getMinPrice(product.variants);
  const category = product.category;
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group relative flex flex-col bg-white">
      {/* Wishlist */}
      <div className="absolute right-3 top-3 z-10">
        <WishlistButton productId={product.id} />
      </div>

      {/* Image */}
      <Link
        href={`/productos/${product.handle}`}
        className="aspect-square overflow-hidden bg-soft"
      >
        {product.thumbnail && !imgError ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-soft">
            <span className="text-4xl">👕</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="mt-3 space-y-1">
        {category && (
          <p className="text-[10px] font-medium uppercase tracking-widest text-brand-400">
            {category.name}
          </p>
        )}

        <Link href={`/productos/${product.handle}`}>
          <h3 className="text-sm text-brand-900 transition group-hover:text-accent-600">
            {product.title}
          </h3>
        </Link>

        {minPrice && (
          <p className="text-sm font-medium text-brand-900">
            {formatPrice(minPrice.amount, minPrice.currency)}
          </p>
        )}
      </div>
    </article>
  );
}
