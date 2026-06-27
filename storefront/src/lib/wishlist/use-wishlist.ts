"use client";

import { useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlistStore } from "@/stores/wishlist-store";
import { addWishlistItem, removeWishlistItem, getWishlist } from "./actions";

// ──────────────────────────────────────────────
// useWishlist
//
// Hook that provides wishlist toggle functionality
// with optimistic updates across all components.
// ──────────────────────────────────────────────

export function useWishlist() {
  const { data: session } = useSession();
  const router = useRouter();

  const items = useWishlistStore((s) => s.items);
  const initialized = useWishlistStore((s) => s.initialized);
  const loading = useWishlistStore((s) => s.loading);
  const initialize = useWishlistStore((s) => s.initialize);
  const setLoading = useWishlistStore((s) => s.setLoading);
  const addOptimistic = useWishlistStore((s) => s.addOptimistic);
  const removeOptimistic = useWishlistStore((s) => s.removeOptimistic);
  const rollbackAdd = useWishlistStore((s) => s.rollbackAdd);
  const rollbackRemove = useWishlistStore((s) => s.rollbackRemove);

  // Load wishlist from server on mount
  useEffect(() => {
    if (session?.user && !initialized && !loading) {
      setLoading(true);
      getWishlist()
        .then((result) => {
          if (result.success) {
            initialize(result.items);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session?.user, initialized, loading, initialize, setLoading]);

  const isWishlisted = useCallback(
    (productId: string): boolean => productId in items,
    [items],
  );

  const toggleItem = useCallback(
    async (productId: string, variantId?: string) => {
      if (!session?.user) {
        router.push("/login");
        return;
      }

      const wasWishlisted = productId in items;
      const previous = items[productId];

      // Optimistic update
      if (wasWishlisted) {
        removeOptimistic(productId);
      } else {
        addOptimistic(productId, variantId);
      }

      // Server action
      const result = wasWishlisted
        ? await removeWishlistItem(productId)
        : await addWishlistItem(productId, variantId);

      // Rollback on error
      if (!result.success) {
        if (wasWishlisted && previous) {
          rollbackRemove(productId, previous);
        } else {
          rollbackAdd(productId);
        }
      }
    },
    [session, items, router, removeOptimistic, addOptimistic, rollbackRemove, rollbackAdd],
  );

  return {
    isWishlisted,
    toggleItem,
    items,
    initialized,
    loading,
    totalItems: Object.keys(items).length,
  };
}
