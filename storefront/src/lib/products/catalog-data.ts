import { prisma } from "@/lib/prisma";

export interface CatalogProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  ageRange: string | null;
  views: number;
  variants: {
    id: string;
    title: string;
    sku: string;
    price: number;
    currency: string;
    inventoryQuantity: number;
  }[];
  category: { name: string; handle: string } | null;
}

export async function getCatalogProducts(): Promise<CatalogProduct[]> {
  const products = await prisma.product.findMany({
    include: {
      variants: {
        select: {
          id: true,
          title: true,
          sku: true,
          price: true,
          currency: true,
          inventoryQuantity: true,
        },
      },
      category: {
        select: {
          name: true,
          handle: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnail: p.thumbnail,
    ageRange: p.ageRange,
    views: p.views,
    variants: p.variants.map((v) => ({
      id: v.id,
      title: v.title,
      sku: v.sku,
      price: v.price,
      currency: v.currency,
      inventoryQuantity: v.inventoryQuantity,
    })),
    category: p.category,
  }));
}
