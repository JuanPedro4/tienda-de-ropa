"use client";

import { useCallback, useState } from "react";
import { useCartStore } from "@/stores/cart-store";

interface AddToCartButtonProps {
  variantId: string | null;
  productId?: string;
  name?: string;
  size?: string;
  color?: string;
  image?: string;
  price?: number;
  maxQuantity?: number;
  disabled?: boolean;
}

export default function AddToCartButton({
  variantId,
  productId = "",
  name = "",
  size = "",
  color,
  image,
  price = 0,
  maxQuantity = 10,
  disabled = false,
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const handleAdd = useCallback(async () => {
    if (!variantId || !productId) return;
    setIsAdding(true);

    // Small delay for UX feedback
    await new Promise((resolve) => setTimeout(resolve, 200));

    addItem({
      variantId,
      productId,
      name,
      size,
      color,
      image,
      price,
      maxQuantity,
      quantity: 1,
    });

    setIsAdding(false);
    setAdded(true);
    openCart();

    setTimeout(() => setAdded(false), 2000);
  }, [variantId, productId, name, size, color, image, price, maxQuantity, addItem, openCart]);

  const isDisabled = disabled || !variantId || !productId || isAdding;

  return (
    <button
      onClick={handleAdd}
      disabled={isDisabled}
      className={`flex w-full items-center justify-center gap-2 px-6 py-3 text-sm font-medium uppercase tracking-wider transition ${
        added
          ? "border border-brand-900 bg-brand-900 text-white"
          : isDisabled
            ? "cursor-not-allowed border border-brand-200 bg-brand-100 text-brand-400"
            : "border border-brand-900 text-brand-900 hover:bg-brand-900 hover:text-white"
      }`}
    >
      {isAdding ? (
        <>
          <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Añadiendo...
        </>
      ) : added ? (
        <>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Añadido
        </>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
          Añadir al carrito
        </>
      )}
    </button>
  );
}
