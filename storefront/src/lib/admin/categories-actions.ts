"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/roles";

// ──────────────────────────────────────────────
// Validation Schema
// ──────────────────────────────────────────────

const CategorySchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  handle: z
    .string()
    .min(1, "El handle es requerido")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  description: z.string().optional(),
  parentId: z.string().nullable().optional(),
  order: z.number().int().min(0).default(0),
});

// ──────────────────────────────────────────────
// getCategories
// ──────────────────────────────────────────────

export async function getCategories() {
  await requireRole("ADMIN");

  const categories = await prisma.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true } },
      children: { select: { id: true, name: true } },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return categories;
}

// ──────────────────────────────────────────────
// getCategory
// ──────────────────────────────────────────────

export async function getCategory(id: string) {
  await requireRole("ADMIN");

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
  });

  return category;
}

// ──────────────────────────────────────────────
// createCategory
// ──────────────────────────────────────────────

export async function createCategory(
  input: z.infer<typeof CategorySchema>,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    const parsed = CategorySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    const data = parsed.data;

    // Check uniqueness
    const existing = await prisma.category.findUnique({ where: { handle: data.handle } });
    if (existing) {
      return { success: false, error: "Ya existe una categoría con ese handle" };
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        handle: data.handle,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        order: data.order,
      },
    });

    revalidatePath("/admin/categorias");
    return { success: true, id: category.id };
  } catch (error) {
    console.error("[admin.createCategory] Error:", error);
    return { success: false, error: "Error al crear la categoría" };
  }
}

// ──────────────────────────────────────────────
// updateCategory
// ──────────────────────────────────────────────

export async function updateCategory(
  id: string,
  input: z.infer<typeof CategorySchema>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    const parsed = CategorySchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    const data = parsed.data;

    // Check handle uniqueness
    const existing = await prisma.category.findFirst({
      where: { handle: data.handle, id: { not: id } },
    });
    if (existing) {
      return { success: false, error: "Ya existe otra categoría con ese handle" };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        handle: data.handle,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        order: data.order,
      },
    });

    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (error) {
    console.error("[admin.updateCategory] Error:", error);
    return { success: false, error: "Error al actualizar la categoría" };
  }
}

// ──────────────────────────────────────────────
// deleteCategory
// ──────────────────────────────────────────────

export async function deleteCategory(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!category) {
      return { success: false, error: "Categoría no encontrada" };
    }

    if (category._count.products > 0) {
      return {
        success: false,
        error: `No se puede eliminar: tiene ${category._count.products} producto(s) asociado(s)`,
      };
    }

    if (category._count.children > 0) {
      return {
        success: false,
        error: `No se puede eliminar: tiene ${category._count.children} subcategoría(s)`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categorias");
    return { success: true };
  } catch (error) {
    console.error("[admin.deleteCategory] Error:", error);
    return { success: false, error: "Error al eliminar la categoría" };
  }
}
