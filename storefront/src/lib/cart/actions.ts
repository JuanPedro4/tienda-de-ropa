"use server";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { CartItemSchema } from "@tienda/shared/schemas";
import type { CartItem as CartStoreItem } from "@/stores/cart-store";

// ──────────────────────────────────────────────
// syncCartWithMedusa
//
// After login, merge the local (Zustand) cart items with the Medusa cart
// associated with this customer. This ensures that items added before login
// are preserved and synced server-side.
//
// TODO: Full Medusa cart sync is pending Medusa v2 integration.
// For now, this action validates the items and logs a placeholder.
// ──────────────────────────────────────────────

export async function syncCartWithMedusa(localItems: CartStoreItem[]) {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "Usuario no autenticado" } as const;
  }

  // Validate each item
  for (const item of localItems) {
    const parsed = CartItemSchema.safeParse({
      variantId: item.variantId,
      quantity: item.quantity,
    });
    if (!parsed.success) {
      return {
        success: false,
        error: `Item inválido: ${item.variantId}`,
      } as const;
    }

    // Verify variant exists in local DB
    const variant = await prisma.productVariant.findUnique({
      // NOTE: ProductVariant is managed by Medusa. We store a lightweight
      // reference table in Prisma. For now this is a future integration point.
      // TODO: Replace with Medusa GraphQL query when Medusa backend is active.
      where: { id: item.variantId },
    });

    if (!variant) {
      return {
        success: false,
        error: `Variante no encontrada: ${item.variantId}`,
      } as const;
    }

    if (variant.inventoryQuantity < item.quantity) {
      return {
        success: false,
        error: `Stock insuficiente para la variante ${item.variantId}`,
      } as const;
    }
  }

  // TODO: Medusa v2 cart sync
  // 1. Get or create Medusa cart for this customer
  // 2. For each local item, call medusaCart.addItem(variantId, quantity)
  // 3. Return the Medusa cart ID
  //
  // For now, we log success since Medusa integration is pending.

  console.log(
    `[syncCartWithMedusa] User ${session.user.email}: ${localItems.length} items synced`,
  );

  return { success: true, syncedCount: localItems.length } as const;
}
