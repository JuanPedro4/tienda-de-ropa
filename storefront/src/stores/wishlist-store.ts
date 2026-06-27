"use client";

import { create } from "zustand";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface WishlistItemData {
  productId: string;
  variantId?: string | null;
  createdAt: string;
}

export interface WishlistStore {
  /** Wishlist items keyed by productId */
  items: Record<string, WishlistItemData>;
  /** Whether initial load has happened */
  initialized: boolean;
  /** True while a server action is in flight */
  loading: boolean;

  // ── Mutations ──
  initialize: (items: WishlistItemData[]) => void;
  addOptimistic: (productId: string, variantId?: string | null) => void;
  removeOptimistic: (productId: string) => void;
  rollbackAdd: (productId: string) => void;
  rollbackRemove: (productId: string, previous: WishlistItemData) => void;
  setLoading: (loading: boolean) => void;

  // ── Selectors ──
  isWishlisted: (productId: string) => boolean;
  getAllItems: () => WishlistItemData[];
}

// ──────────────────────────────────────────────
// Store
// ──────────────────────────────────────────────

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  items: {},
  initialized: false,
  loading: false,

  initialize: (items) =>
    set({
      items: items.reduce(
        (acc, item) => {
          acc[item.productId] = item;
          return acc;
        },
        {} as Record<string, WishlistItemData>,
      ),
      initialized: true,
    }),

  addOptimistic: (productId, variantId) =>
    set((state) => ({
      items: {
        ...state.items,
        [productId]: {
          productId,
          variantId: variantId ?? null,
          createdAt: new Date().toISOString(),
        },
      },
    })),

  removeOptimistic: (productId) =>
    set((state) => {
      const next = { ...state.items };
      delete next[productId];
      return { items: next };
    }),

  rollbackAdd: (productId) =>
    set((state) => {
      const next = { ...state.items };
      delete next[productId];
      return { items: next };
    }),

  rollbackRemove: (productId, previous) =>
    set((state) => ({
      items: { ...state.items, [productId]: previous },
    })),

  setLoading: (loading) => set({ loading }),

  isWishlisted: (productId) => productId in get().items,
  getAllItems: () => Object.values(get().items),
}));
