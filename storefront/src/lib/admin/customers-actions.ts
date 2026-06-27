"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/roles";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface CustomerListItem {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
}

export interface CustomerDetail extends CustomerListItem {
  orders: Array<{
    id: string;
    total: number;
    currency: string;
    status: string;
    createdAt: Date;
    storeName: string | null;
  }>;
  wishlist: Array<{
    id: string;
    productId: string;
    productTitle: string | null;
    createdAt: Date;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    productId: string;
    productTitle: string | null;
    status: string;
    createdAt: Date;
  }>;
}

// ──────────────────────────────────────────────
// getCustomers
// ──────────────────────────────────────────────

export async function getCustomers() {
  await requireRole("ADMIN");

  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Fetch orders per customer
  const customers: CustomerListItem[] = [];

  for (const user of users) {
    const orderAgg = await prisma.order.aggregate({
      where: { customerId: user.id },
      _count: true,
      _sum: { total: true },
    });

    customers.push({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      totalOrders: orderAgg._count,
      totalSpent: orderAgg._sum.total ?? 0,
      createdAt: user.createdAt,
    });
  }

  return customers;
}

// ──────────────────────────────────────────────
// getCustomerDetail
// ──────────────────────────────────────────────

export async function getCustomerDetail(
  customerId: string,
): Promise<CustomerDetail | null> {
  await requireRole("ADMIN");

  const user = await prisma.user.findUnique({
    where: { id: customerId },
  });

  if (!user) return null;

  // Orders
  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: {
      store: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Wishlist
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Reviews
  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // Get product titles for wishlist + reviews
  const allProductIds = [
    ...wishlistItems.map((w) => w.productId),
    ...reviews.map((r) => r.productId),
  ];

  const products = await prisma.product.findMany({
    where: { id: { in: allProductIds } },
    select: { id: true, title: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p.title]));

  const orderAgg = await prisma.order.aggregate({
    where: { customerId: user.id },
    _count: true,
    _sum: { total: true },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    totalOrders: orderAgg._count,
    totalSpent: orderAgg._sum.total ?? 0,
    createdAt: user.createdAt,
    orders: orders.map((o) => ({
      id: o.id,
      total: o.total,
      currency: o.currency,
      status: o.status,
      createdAt: o.createdAt,
      storeName: o.store?.name ?? null,
    })),
    wishlist: wishlistItems.map((w) => ({
      id: w.id,
      productId: w.productId,
      productTitle: productMap.get(w.productId) ?? null,
      createdAt: w.createdAt,
    })),
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      productId: r.productId,
      productTitle: productMap.get(r.productId) ?? null,
      status: r.status,
      createdAt: r.createdAt,
    })),
  };
}
