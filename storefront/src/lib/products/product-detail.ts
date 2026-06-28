import { prisma } from "@/lib/prisma";

interface ProductImage {
  url: string;
  alt: string | null;
}

interface Certification {
  name: string;
  badge?: string;
}

interface Variant {
  id: string;
  sku: string;
  title: string;
  inventoryQuantity: number;
  allowBackorder: boolean;
  options: { name: string; value: string }[];
  prices: { amount: number; currencyCode: string }[];
}

interface Category {
  id: string;
  name: string;
  handle: string;
}

export interface ProductDetail {
  id: string;
  title: string;
  subtitle?: string;
  handle: string;
  description: string;
  material?: string;
  originCountry?: string;
  thumbnail: string | null;
  images: ProductImage[];
  variants: Variant[];
  categories: Category[];
  certifications: Certification[];
}

export async function getProductByHandle(handle: string): Promise<ProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { handle },
    include: {
      variants: true,
      category: true,
    },
  });

  if (!product) return null;

  const images: ProductImage[] = [];
  if (product.thumbnail) {
    images.push({ url: product.thumbnail, alt: product.title });
  }
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      const entry = img as Record<string, unknown>;
      const url = typeof img === "string" ? img : (entry.url as string | undefined);
      if (url && url !== product.thumbnail) {
        images.push({ url, alt: product.title });
      }
    }
  }

  const certs = Array.isArray(product.certifications)
    ? (product.certifications as unknown as Certification[])
    : [];

  const categories: Category[] = product.category
    ? [{ id: product.category.id, name: product.category.name, handle: product.category.handle }]
    : [];

  const variants: Variant[] = product.variants.map((v) => ({
    id: v.id,
    sku: v.sku,
    title: v.title,
    inventoryQuantity: v.inventoryQuantity,
    allowBackorder: v.allowBackorder,
    options: [{ name: "Talle", value: v.title }],
    prices: [{ amount: v.price, currencyCode: v.currency }],
  }));

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    description: product.description ?? "",
    material: product.material ?? undefined,
    originCountry: product.countryOfOrigin ?? undefined,
    thumbnail: product.thumbnail,
    images,
    variants,
    categories,
    certifications: certs,
  };
}