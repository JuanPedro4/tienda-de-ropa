"use server";

import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { WishlistItemData } from "@/stores/wishlist-store";

// ──────────────────────────────────────────────
// Validation schemas
// ──────────────────────────────────────────────

const AddSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional(),
});

const RemoveSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Ensure the user is authenticated.
 * Returns the user ID or redirects to login.
 */
async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Usuario no autenticado");
  }
  return session.user.id;
}

function serializeItem(item: {
  productId: string;
  variantId: string | null;
  createdAt: Date;
}): WishlistItemData {
  return {
    productId: item.productId,
    variantId: item.variantId,
    createdAt: item.createdAt.toISOString(),
  };
}

// ──────────────────────────────────────────────
// getWishlist
//
// Returns all wishlist items for the current user.
// Called by the client store to initialize state.
// ──────────────────────────────────────────────

export async function getWishlist(): Promise<{
  success: true;
  items: WishlistItemData[];
}> {
  const userId = await requireUserId();

  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, items: items.map(serializeItem) };
}

// ──────────────────────────────────────────────
// addWishlistItem
//
// Adds a product to the user's wishlist.
// Handles the unique constraint ([userId, productId, variantId])
// gracefully — if the item already exists, returns success.
// ──────────────────────────────────────────────

export async function addWishlistItem(
  productId: string,
  variantId?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const parsed = AddSchema.safeParse({ productId, variantId });
    if (!parsed.success) {
      return {
        success: false,
        error: "Datos inválidos: " + parsed.error.errors.map((e) => e.message).join(", "),
      } as const;
    }

    const userId = await requireUserId();

    // Use upsert to handle the unique constraint gracefully
    await prisma.wishlistItem.upsert({
      where: {
        userId_productId_variantId: {
          userId,
          productId: parsed.data.productId,
          variantId: parsed.data.variantId ?? "",
        },
      },
      update: {}, // Already exists — no-op
      create: {
        userId,
        productId: parsed.data.productId,
        variantId: parsed.data.variantId ?? null,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return { success: false, error: error.message };
    }

    console.error("[wishlist.addWishlistItem] Error:", error);
    return { success: false, error: "Error al agregar a favoritos" };
  }
}

// ──────────────────────────────────────────────
// removeWishlistItem
//
// Removes a product from the user's wishlist.
// ──────────────────────────────────────────────

export async function removeWishlistItem(
  productId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const parsed = RemoveSchema.safeParse({ productId });
    if (!parsed.success) {
      return {
        success: false,
        error: "Datos inválidos",
      } as const;
    }

    const userId = await requireUserId();

    await prisma.wishlistItem.deleteMany({
      where: {
        userId,
        productId: parsed.data.productId,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return { success: false, error: error.message };
    }

    console.error("[wishlist.removeWishlistItem] Error:", error);
    return { success: false, error: "Error al quitar de favoritos" };
  }
}

// ──────────────────────────────────────────────
// moveAllToCart
//
// Returns all wishlist items so the client can
// add them to the Zustand cart. The actual cart
// mutation is client-side because the cart is
// stored in Zustand (localStorage).
// ──────────────────────────────────────────────

export async function moveAllToCart(): Promise<
  | { success: true; items: Array<{ productId: string; variantId: string | null }> }
  | { success: false; error: string }
> {
  try {
    const userId = await requireUserId();

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: {
        user: false,
      },
    });

    return {
      success: true,
      items: wishlistItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
      })),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return { success: false, error: error.message };
    }

    console.error("[wishlist.moveAllToCart] Error:", error);
    return { success: false, error: "Error al mover al carrito" };
  }
}
