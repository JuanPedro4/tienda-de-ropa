import { prisma } from "@/lib/prisma";

export interface TopViewedProduct {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  views: number;
  variants: { price: number; currency: string }[];
  category: { name: string; handle: string } | null;
}

export async function getTopViewedProducts(limit = 10): Promise<TopViewedProduct[]> {
  const products = await prisma.product.findMany({
    where: { views: { gt: 0 } },
    orderBy: { views: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      handle: true,
      thumbnail: true,
      views: true,
      variants: {
        select: { price: true, currency: true },
        take: 1,
      },
      category: {
        select: { name: true, handle: true },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    title: p.title,
    handle: p.handle,
    thumbnail: p.thumbnail,
    views: p.views,
    variants: p.variants.map((v) => ({ price: v.price, currency: v.currency })),
    category: p.category,
  }));
}
