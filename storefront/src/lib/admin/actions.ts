"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/roles";

// ──────────────────────────────────────────────
// Generate a random 6-character alphanumeric code
// ──────────────────────────────────────────────

function generatePickupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0, O, I, 1 to avoid confusion
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ──────────────────────────────────────────────
// admin.markReady
//
// Marks an order as ready for pickup, generates a
// 6-character pickup code, and sends a notification
// email (placeholder).
// ──────────────────────────────────────────────

export async function markReady(orderId: string) {
  // Require admin role — redirects if unauthorized
  await requireRole("ADMIN");

  if (!orderId || typeof orderId !== "string") {
    return { success: false, error: "ID de pedido inválido" } as const;
  }

  // Verify the order exists and is in a valid state
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    return { success: false, error: "Pedido no encontrado" } as const;
  }

  const validStatuses = ["CONFIRMED", "PREPARING"];
  if (!validStatuses.includes(order.status)) {
    return {
      success: false,
      error: `El pedido está en estado "${order.status}" y no puede marcarse como listo`,
    } as const;
  }

  // Generate unique pickup code
  const code = generatePickupCode();

  // Use a transaction to ensure atomicity
  await prisma.$transaction(async (tx) => {
    // Verify no other order has this code (extremely unlikely but let's be safe)
    const existing = await tx.order.findUnique({
      where: { pickupCode: code },
    });

    if (existing) {
      throw new Error("Collisión en código de retiro, reintentar");
    }

    return tx.order.update({
      where: { id: orderId },
      data: {
        status: "READY",
        pickupCode: code,
      },
    });
  });

  // TODO: Send email to customer with pickup code
  // Integrate with Resend or similar email service
  console.log(
    `[admin.markReady] Order ${orderId} marked as READY`,
    `-- Code: ${code}`,
    `-- TODO: Send pickup email to ${order.customerEmail}`,
    `-- Subject: Tu pedido está listo para retirar`,
    `-- Body: Código de retiro: ${code}. Sucursal: ${order.storeId}`,
  );

  // Invalidate order cache if applicable
  // TODO: invalidate cache for this order

  return { success: true, pickupCode: code } as const;
}

// ──────────────────────────────────────────────
// admin.markPickedUp
//
// Verifies the pickup code matches and marks the
// order as picked up.
// ──────────────────────────────────────────────

export async function markPickedUp(
  orderId: string,
  code: string,
) {
  // Require admin role — redirects if unauthorized
  await requireRole("ADMIN");

  if (!orderId || typeof orderId !== "string") {
    return { success: false, error: "ID de pedido inválido" } as const;
  }

  if (!code || code.length !== 6) {
    return {
      success: false,
      error: "Código de retiro inválido (debe tener 6 caracteres)",
    } as const;
  }

  // Verify the order exists
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    return { success: false, error: "Pedido no encontrado" } as const;
  }

  if (order.status !== "READY") {
    return {
      success: false,
      error:
        order.status === "PICKED_UP"
          ? "Este pedido ya fue retirado"
          : `El pedido no está listo para retirar (estado: ${order.status})`,
    } as const;
  }

  // Verify pickup code
  if (order.pickupCode !== code) {
    return { success: false, error: "Código de retiro incorrecto" } as const;
  }

  // Mark as picked up
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "PICKED_UP",
    },
  });

  console.log(
    `[admin.markPickedUp] Order ${orderId} marked as PICKED_UP`,
  );

  return { success: true } as const;
}
