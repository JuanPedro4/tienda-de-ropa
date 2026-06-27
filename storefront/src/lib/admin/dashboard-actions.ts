"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/roles";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface DashboardData {
  salesToday: number;
  salesWeek: number;
  salesMonth: number;
  pendingOrders: number;
  outOfStock: number;
  lowStock: number;
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    currency: string;
    status: string;
    createdAt: Date;
  }>;
  lowStockProducts: Array<{
    id: string;
    title: string;
    sku: string;
    stock: number;
  }>;
}

// ──────────────────────────────────────────────
// getDashboardData
// ──────────────────────────────────────────────

export async function getDashboardData(): Promise<DashboardData> {
  await requireRole("ADMIN");

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    salesToday,
    salesWeek,
    salesMonth,
    pendingOrders,
    outOfStockCount,
    lowStockVariants,
    recentOrders,
  ] = await Promise.all([
    // Sales today (picked up orders)
    prisma.order.aggregate({
      where: {
        status: "PICKED_UP",
        updatedAt: { gte: startOfDay },
      },
      _sum: { total: true },
    }),
    // Sales this week
    prisma.order.aggregate({
      where: {
        status: "PICKED_UP",
        updatedAt: { gte: startOfWeek },
      },
      _sum: { total: true },
    }),
    // Sales this month
    prisma.order.aggregate({
      where: {
        status: "PICKED_UP",
        updatedAt: { gte: startOfMonth },
      },
      _sum: { total: true },
    }),
    // Pending orders count
    prisma.order.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "PREPARING", "READY"] } },
    }),
    // Out of stock variants
    prisma.productVariant.count({
      where: { inventoryQuantity: 0 },
    }),
    // Low stock variants (< 5)
    prisma.productVariant.findMany({
      where: { inventoryQuantity: { gt: 0, lt: 5 } },
      include: {
        product: { select: { id: true, title: true } },
      },
      orderBy: { inventoryQuantity: "asc" },
      take: 10,
    }),
    // Recent orders
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return {
    salesToday: salesToday._sum.total ?? 0,
    salesWeek: salesWeek._sum.total ?? 0,
    salesMonth: salesMonth._sum.total ?? 0,
    pendingOrders,
    outOfStock: outOfStockCount,
    lowStock: lowStockVariants.length,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      total: o.total,
      currency: o.currency,
      status: o.status,
      createdAt: o.createdAt,
    })),
    lowStockProducts: lowStockVariants.map((v) => ({
      id: v.product.id,
      title: v.product.title,
      sku: v.sku,
      stock: v.inventoryQuantity,
    })),
  };
}
