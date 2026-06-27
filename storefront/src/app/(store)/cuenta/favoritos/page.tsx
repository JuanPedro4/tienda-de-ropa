"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { getMockProductById } from "@/lib/products/mock-data";
import { moveAllToCart as moveAllToCartAction } from "@/lib/wishlist/actions";
import { useCartStore } from "@/stores/cart-store";

// ──────────────────────────────────────────────
// Local helpers
// ──────────────────────────────────────────────

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function getMinPrice(
  variants: { prices: { amount: number; currencyCode: string }[] }[],
): { amount: number; currencyCode: string } | null {
  if (variants.length === 0) return null;
  return variants.reduce((min, v) => {
    const price = v.prices[0];
    if (!price) return min;
    return !min || price.amount < min.amount ? price : min;
  }, null as { amount: number; currencyCode: string } | null);
}

function getLowestStock(
  variants: { inventoryQuantity: number }[],
): number {
  return variants.reduce(
    (min, v) => Math.min(min, v.inventoryQuantity),
    Infinity,
  );
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export default function WishlistPage() {
  const { data: session } = useSession();
  const items = useWishlistStore((s) => s.items);
  const removeOptimistic = useWishlistStore((s) => s.removeOptimistic);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const productIds = useMemo(() => Object.keys(items), [items]);

  const productsWithStock = useMemo(
    () =>
      productIds
        .map((pid) => {
          const product = getMockProductById(pid);
          if (!product) return null;
          const stock = getLowestStock(product.variants);
          const price = getMinPrice(product.variants);
          return { ...product, stock, price };
        })
        .filter(Boolean) as Array<
          ReturnType<typeof getMockProductById> & {
            stock: number;
            price: { amount: number; currencyCode: string } | null;
          }
        >,
    [productIds],
  );

  // ── Remove item ──

  const handleRemove = useCallback(
    async (productId: string) => {
      const { removeWishlistItem } = await import(
        "@/lib/wishlist/actions"
      );
      const previous = items[productId];
      removeOptimistic(productId);
      const result = await removeWishlistItem(productId);
      if (!result.success && previous) {
        useWishlistStore.getState().rollbackRemove(productId, previous);
      }
    },
    [items, removeOptimistic],
  );

  // ── Move single item to cart ──

  const handleMoveToCart = useCallback(
    (productId: string) => {
      const product = getMockProductById(productId);
      if (!product) return;

      // Find first in-stock variant
      const variant = product.variants.find(
        (v) => v.inventoryQuantity > 0,
      );
      if (!variant) return;

      addItem({
        variantId: variant.id,
        productId: product.id,
        name: product.title,
        size: variant.title,
        price: variant.prices[0]?.amount ?? 0,
        quantity: 1,
        maxQuantity: variant.inventoryQuantity,
      });
      openCart();
    },
    [addItem, openCart],
  );

  // ── Move all to cart ──

  const handleMoveAllToCart = useCallback(async () => {
    const result = await moveAllToCartAction();
    if (!result.success) return;

    let added = 0;
    for (const wishItem of result.items) {
      const product = getMockProductById(wishItem.productId);
      if (!product) continue;

      const variant = product.variants.find(
        (v) =>
          v.inventoryQuantity > 0 &&
          (!wishItem.variantId || v.id === wishItem.variantId),
      );
      if (!variant) continue;

      addItem({
        variantId: variant.id,
        productId: product.id,
        name: product.title,
        size: variant.title,
        price: variant.prices[0]?.amount ?? 0,
        quantity: 1,
        maxQuantity: variant.inventoryQuantity,
      });
      added++;
    }

    if (added > 0) {
      openCart();
    }
  }, [addItem, openCart]);

  // ── Loading state ──

  if (!session?.user) {
    return null; // middleware will redirect
  }

  // ── Empty state ──

  if (productIds.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-8 text-2xl font-light text-brand-900">
          Mis favoritos
        </h1>
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
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <h2 className="text-sm font-medium text-brand-900">
            No tenés favoritos guardados
          </h2>
          <p className="mt-1 text-xs text-brand-400">
            Explorá nuestros productos y guardá tus favoritos con el corazón.
          </p>
          <Link
            href="/productos"
            className="mt-6 inline-block border border-brand-900 px-6 py-3 text-xs font-medium uppercase tracking-widest text-brand-900 transition hover:bg-brand-900 hover:text-white"
          >
            Ver productos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light text-brand-900">
            Mis favoritos
          </h1>
          <p className="text-xs text-brand-400">
            {productIds.length}{" "}
            {productIds.length === 1 ? "producto" : "productos"}
          </p>
        </div>
        <button
          onClick={handleMoveAllToCart}
          className="border border-brand-200 px-4 py-2 text-xs font-medium uppercase tracking-wider text-brand-600 transition hover:bg-surface"
        >
          Mover todos al carrito
        </button>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {productsWithStock.map((product) => {
          const price = product.price;
          const isOutOfStock = product.stock === 0;

          return (
            <article
              key={product.id}
              className="group relative flex flex-col bg-white"
            >
              {/* Remove button */}
              <button
                onClick={() => handleRemove(product.id)}
                className="absolute right-3 top-3 z-10 text-brand-400 transition hover:text-red-500"
                aria-label="Quitar de favoritos"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Stock badge */}
              {isOutOfStock && (
                <span className="absolute left-3 top-3 z-10 border border-brand-200 bg-white px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-brand-500">
                  Agotado
                </span>
              )}

              {/* Image */}
              <Link
                href={`/productos/${product.handle}`}
                className="aspect-square overflow-hidden bg-soft"
              >
                {product.thumbnail ? (
                  <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-brand-300">
                    <svg
                      className="h-10 w-10"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </Link>

              {/* Content */}
              <div className="mt-3 space-y-1">
                <p className="text-[10px] font-medium uppercase tracking-widest text-brand-400">
                  {product.categories[0]?.name ?? ""}
                </p>

                <Link href={`/productos/${product.handle}`}>
                  <h3 className="text-sm text-brand-900 transition">
                    {product.title}
                  </h3>
                </Link>

                {price && (
                  <p className="text-sm font-medium text-brand-900">
                    {formatPrice(price.amount, price.currencyCode)}
                  </p>
                )}

                {/* Move to cart button */}
                <button
                  onClick={() => handleMoveToCart(product.id)}
                  disabled={isOutOfStock}
                  className={`mt-3 block w-full py-2 text-xs font-medium uppercase tracking-wider transition ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-brand-100 text-brand-400"
                      : "border border-brand-900 text-brand-900 hover:bg-brand-900 hover:text-white"
                  }`}
                >
                  {isOutOfStock ? "Sin stock" : "Mover al carrito"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
