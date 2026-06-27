"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/roles";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "READY" | "PICKED_UP" | "CANCELLED";

export interface OrderListItem {
  id: string;
  customerName: string;
  customerEmail: string;
  customerId: string | null;
  total: number;
  currency: string;
  status: OrderStatus;
  store: { name: string } | null;
  itemCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderDetail extends OrderListItem {
  items: unknown;
  pickupCode: string | null;
  notes: string | null;
  stripeSessionId: string | null;
  statusHistory: Array<{
    status: string;
    timestamp: string;
  }>;
  store: {
    name: string;
    address: string;
    city: string;
    phone: string | null;
    hours: unknown;
  } | null;
}

// ──────────────────────────────────────────────
// getOrders — list all orders for admin
// ──────────────────────────────────────────────

export async function getOrders(
  statusFilter?: OrderStatus,
): Promise<OrderListItem[]> {
  await requireRole("ADMIN");

  const where = statusFilter ? { status: statusFilter } : {};

  const orders = await prisma.order.findMany({
    where,
    include: {
      store: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return orders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerId: o.customerId,
    total: o.total,
    currency: o.currency,
    status: o.status as OrderStatus,
    store: o.store,
    itemCount: Array.isArray(o.items) ? o.items.length : 0,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  }));
}

// ──────────────────────────────────────────────
// getOrderDetail — single order with full detail
// ──────────────────────────────────────────────

export async function getOrderDetail(
  id: string,
): Promise<OrderDetail | null> {
  await requireRole("ADMIN");

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      store: {
        select: { name: true, address: true, city: true, phone: true, hours: true },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerId: order.customerId,
    total: order.total,
    currency: order.currency,
    status: order.status as OrderStatus,
    store: order.store
      ? {
          name: order.store.name,
          address: order.store.address,
          city: order.store.city,
          phone: order.store.phone,
          hours: order.store.hours,
        }
      : null,
    itemCount: Array.isArray(order.items) ? order.items.length : 0,
    items: order.items,
    pickupCode: order.pickupCode,
    notes: order.notes,
    stripeSessionId: order.stripeSessionId,
    statusHistory: order.statusHistory as Array<{ status: string; timestamp: string }>,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

// ──────────────────────────────────────────────
// updateOrderStatus
// ──────────────────────────────────────────────

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    if (!orderId) {
      return { success: false, error: "ID de pedido inválido" };
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return { success: false, error: "Pedido no encontrado" };
    }

    // Valid status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING", "CANCELLED"],
      PREPARING: ["READY", "CANCELLED"],
      READY: ["PICKED_UP"],
      PICKED_UP: [],
      CANCELLED: [],
    };

    const allowed = validTransitions[order.status as OrderStatus];
    if (!allowed?.includes(newStatus)) {
      return {
        success: false,
        error: `No se puede cambiar de "${order.status}" a "${newStatus}"`,
      };
    }

    const history = (order.statusHistory as Array<{ status: string; timestamp: string }>) ?? [];
    history.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
    });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: history,
      },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("[admin.updateOrderStatus] Error:", error);
    return { success: false, error: "Error al actualizar el estado del pedido" };
  }
}

// ──────────────────────────────────────────────
// generatePickupCode
// ──────────────────────────────────────────────

function generatePickupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ──────────────────────────────────────────────
// markReady — mark order as ready with pickup code
// ──────────────────────────────────────────────

export async function markReady(orderId: string) {
  try {
    await requireRole("ADMIN");

    if (!orderId) {
      return { success: false, error: "ID de pedido inválido" };
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return { success: false, error: "Pedido no encontrado" };
    }

    const validStatuses: OrderStatus[] = ["CONFIRMED", "PREPARING"];
    if (!validStatuses.includes(order.status as OrderStatus)) {
      return {
        success: false,
        error: `El pedido está en estado "${order.status}" y no puede marcarse como listo`,
      };
    }

    const code = generatePickupCode();

    await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { pickupCode: code } });
      if (existing) {
        throw new Error("Colisión en código de retiro, reintentar");
      }

      const history = (order.statusHistory as Array<{ status: string; timestamp: string }>) ?? [];
      history.push({ status: "READY", timestamp: new Date().toISOString() });

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: "READY",
          pickupCode: code,
          statusHistory: history,
        },
      });
    });

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true, pickupCode: code };
  } catch (error) {
    console.error("[admin.markReady] Error:", error);
    return { success: false, error: "Error al marcar como listo" };
  }
}

// ──────────────────────────────────────────────
// markPickedUp — verify code and mark as picked up
// ──────────────────────────────────────────────

export async function markPickedUp(orderId: string, code: string) {
  try {
    await requireRole("ADMIN");

    if (!orderId) {
      return { success: false, error: "ID de pedido inválido" };
    }
    if (!code || code.length !== 6) {
      return { success: false, error: "Código de retiro inválido" };
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return { success: false, error: "Pedido no encontrado" };
    }

    if (order.status !== "READY") {
      return {
        success: false,
        error:
          order.status === "PICKED_UP"
            ? "Este pedido ya fue retirado"
            : `El pedido no está listo para retirar (estado: ${order.status})`,
      };
    }

    if (order.pickupCode !== code) {
      return { success: false, error: "Código de retiro incorrecto" };
    }

    const history = (order.statusHistory as Array<{ status: string; timestamp: string }>) ?? [];
    history.push({ status: "PICKED_UP", timestamp: new Date().toISOString() });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "PICKED_UP",
        statusHistory: history,
      },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("[admin.markPickedUp] Error:", error);
    return { success: false, error: "Error al marcar como retirado" };
  }
}

// ──────────────────────────────────────────────
// cancelOrder
// ──────────────────────────────────────────────

export async function cancelOrder(
  orderId: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return { success: false, error: "Pedido no encontrado" };
    }

    const cancellable: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING"];
    if (!cancellable.includes(order.status as OrderStatus)) {
      return {
        success: false,
        error: `No se puede cancelar un pedido en estado "${order.status}"`,
      };
    }

    const history = (order.statusHistory as Array<{ status: string; timestamp: string }>) ?? [];
    history.push({ status: "CANCELLED", timestamp: new Date().toISOString() });

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        statusHistory: history,
      },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { success: true };
  } catch (error) {
    console.error("[admin.cancelOrder] Error:", error);
    return { success: false, error: "Error al cancelar el pedido" };
  }
}
