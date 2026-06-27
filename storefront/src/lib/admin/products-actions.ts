"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/roles";

// ──────────────────────────────────────────────
// Validation Schemas
// ──────────────────────────────────────────────

const ProductImageSchema = z.object({
  url: z.string().url("URL de imagen inválida"),
  alt: z.string().optional(),
});

const ProductVariantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU es requerido"),
  title: z.string().min(1, "Talle/nombre es requerido"),
  color: z.string().optional(),
  price: z.number().int().min(0, "El precio debe ser ≥ 0"),
  currency: z.string().default("EUR"),
  inventoryQuantity: z.number().int().min(0, "El stock debe ser ≥ 0"),
  allowBackorder: z.boolean().default(false),
});

const CreateProductSchema = z.object({
  title: z.string().min(1, "El nombre es requerido"),
  handle: z
    .string()
    .min(1, "El handle es requerido")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  description: z.string().optional(),
  material: z.string().optional(),
  countryOfOrigin: z.string().optional(),
  categoryId: z.string().optional(),
  certifications: z.array(z.string()).default([]),
  images: z.array(ProductImageSchema).default([]),
  thumbnail: z.string().optional(),
  variants: z.array(ProductVariantSchema).min(1, "Al menos una variante es requerida"),
});

const UpdateProductSchema = CreateProductSchema.partial().extend({
  variants: z.array(ProductVariantSchema).optional(),
});

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ──────────────────────────────────────────────
// getProducts — list all products for admin
// ──────────────────────────────────────────────

export async function getProducts() {
  await requireRole("ADMIN");

  const products = await prisma.product.findMany({
    include: {
      variants: true,
      category: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    ...p,
    images: p.images as Array<{ url: string; alt?: string }>,
    certifications: p.certifications as string[],
  }));
}

// ──────────────────────────────────────────────
// getProduct — single product for editing
// ──────────────────────────────────────────────

export async function getProduct(id: string) {
  await requireRole("ADMIN");

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: true },
  });

  if (!product) return null;

  return {
    ...product,
    images: product.images as Array<{ url: string; alt?: string }>,
    certifications: product.certifications as string[],
  };
}

// ──────────────────────────────────────────────
// createProduct — create a new product
// ──────────────────────────────────────────────

export async function createProduct(
  input: z.infer<typeof CreateProductSchema>,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    const parsed = CreateProductSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    const data = parsed.data;
    const handle = data.handle || slugify(data.title);

    // Check handle uniqueness
    const existing = await prisma.product.findUnique({ where: { handle } });
    if (existing) {
      return { success: false, error: "Ya existe un producto con ese handle" };
    }

    const product = await prisma.product.create({
      data: {
        title: data.title,
        handle,
        description: data.description ?? null,
        material: data.material ?? null,
        countryOfOrigin: data.countryOfOrigin ?? null,
        categoryId: data.categoryId ?? null,
        thumbnail: data.thumbnail ?? null,
        images: data.images,
        certifications: data.certifications,
        variants: {
          create: data.variants.map((v) => ({
            sku: v.sku,
            title: v.title,
            color: v.color ?? null,
            price: v.price,
            currency: v.currency,
            inventoryQuantity: v.inventoryQuantity,
            allowBackorder: v.allowBackorder,
          })),
        },
      },
      include: { variants: true },
    });

    revalidatePath("/admin/productos");
    return { success: true, id: product.id };
  } catch (error) {
    console.error("[admin.createProduct] Error:", error);
    return { success: false, error: "Error al crear el producto" };
  }
}

// ──────────────────────────────────────────────
// updateProduct — update an existing product
// ──────────────────────────────────────────────

export async function updateProduct(
  id: string,
  input: z.infer<typeof UpdateProductSchema>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    const parsed = UpdateProductSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    const data = parsed.data;

    // If handle changed, check uniqueness
    if (data.handle) {
      const existing = await prisma.product.findFirst({
        where: { handle: data.handle, id: { not: id } },
      });
      if (existing) {
        return { success: false, error: "Ya existe un producto con ese handle" };
      }
    }

    // Use a transaction for atomicity
    await prisma.$transaction(async (tx) => {
      // Update product fields
      await tx.product.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.handle !== undefined && { handle: data.handle }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.material !== undefined && { material: data.material }),
          ...(data.countryOfOrigin !== undefined && { countryOfOrigin: data.countryOfOrigin }),
          ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
          ...(data.thumbnail !== undefined && { thumbnail: data.thumbnail }),
          ...(data.images !== undefined && { images: data.images }),
          ...(data.certifications !== undefined && { certifications: data.certifications }),
        },
      });

      // If variants provided, replace them
      if (data.variants) {
        // Delete existing variants
        await tx.productVariant.deleteMany({ where: { productId: id } });

        // Create new variants
        for (const v of data.variants) {
          await tx.productVariant.create({
            data: {
              productId: id,
              sku: v.sku,
              title: v.title,
              color: v.color ?? null,
              price: v.price,
              currency: v.currency,
              inventoryQuantity: v.inventoryQuantity,
              allowBackorder: v.allowBackorder,
            },
          });
        }
      }
    });

    revalidatePath("/admin/productos");
    revalidatePath(`/admin/productos/${id}/editar`);
    return { success: true };
  } catch (error) {
    console.error("[admin.updateProduct] Error:", error);
    return { success: false, error: "Error al actualizar el producto" };
  }
}

// ──────────────────────────────────────────────
// deleteProduct
// ──────────────────────────────────────────────

export async function deleteProduct(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return { success: false, error: "Producto no encontrado" };
    }

    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/productos");
    return { success: true };
  } catch (error) {
    console.error("[admin.deleteProduct] Error:", error);
    return { success: false, error: "Error al eliminar el producto" };
  }
}
