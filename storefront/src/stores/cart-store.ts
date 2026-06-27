"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  size: string;
  color?: string;
  image?: string;
  price: number; // cents
  quantity: number;
  maxQuantity: number; // stock available
}

export interface CartStore {
  /** Cart items keyed by variantId */
  items: Record<string, CartItem>;
  /** Whether the cart drawer is open */
  isOpen: boolean;

  // ── Mutations ──
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;

  // ── UI ──
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // ── Selectors (computed via store api) ──
}

// ──────────────────────────────────────────────
// Tax rate: 21% IVA (Spain)
// ──────────────────────────────────────────────
export const TAX_RATE = 0.21;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function itemsArray(items: Record<string, CartItem>): CartItem[] {
  return Object.values(items);
}

function totalItems(items: Record<string, CartItem>): number {
  return itemsArray(items).reduce((sum, item) => sum + item.quantity, 0);
}

function subtotal(items: Record<string, CartItem>): number {
  return itemsArray(items).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
}

function tax(items: Record<string, CartItem>): number {
  return Math.round(subtotal(items) * TAX_RATE);
}

function total(items: Record<string, CartItem>): number {
  return subtotal(items) + tax(items);
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: {},
      isOpen: false,

      addItem: (newItem) =>
        set((state) => {
          const existing = state.items[newItem.variantId];
          if (existing) {
            const newQty = Math.min(
              existing.quantity + (newItem.quantity ?? 1),
              existing.maxQuantity,
            );
            return {
              items: {
                ...state.items,
                [newItem.variantId]: { ...existing, quantity: newQty },
              },
            };
          }
          return {
            items: {
              ...state.items,
              [newItem.variantId]: {
                variantId: newItem.variantId,
                productId: newItem.productId,
                name: newItem.name,
                size: newItem.size,
                color: newItem.color,
                image: newItem.image,
                price: newItem.price,
                quantity: newItem.quantity ?? 1,
                maxQuantity: newItem.maxQuantity,
              },
            },
          };
        }),

      removeItem: (variantId) =>
        set((state) => {
          const next = { ...state.items };
          delete next[variantId];
          return { items: next };
        }),

      updateQuantity: (variantId, quantity) =>
        set((state) => {
          const item = state.items[variantId];
          if (!item) return state;
          if (quantity <= 0) {
            const next = { ...state.items };
            delete next[variantId];
            return { items: next };
          }
          return {
            items: {
              ...state.items,
              [variantId]: {
                ...item,
                quantity: Math.min(quantity, item.maxQuantity),
              },
            },
          };
        }),

      clearCart: () => set({ items: {} }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    {
      name: "tienda-cart",
      partialize: (state) => ({
        items: state.items,
      }),
    },
  ),
);

// ──────────────────────────────────────────────
// Selector hooks (reactive via zustand)
// ──────────────────────────────────────────────

export function useCartItems(): CartItem[] {
  return itemsArray(useCartStore((s) => s.items));
}

export function useCartTotalItems(): number {
  return totalItems(useCartStore((s) => s.items));
}

export function useCartSubtotal(): number {
  return subtotal(useCartStore((s) => s.items));
}

export function useCartTax(): number {
  return tax(useCartStore((s) => s.items));
}

export function useCartTotal(): number {
  return total(useCartStore((s) => s.items));
}

export function useCartIsEmpty(): boolean {
  return useCartStore((s) => Object.keys(s.items).length === 0);
}
