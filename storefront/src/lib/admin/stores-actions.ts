"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/roles";

// ──────────────────────────────────────────────
// Validation Schema
// ──────────────────────────────────────────────

const StoreSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  slug: z
    .string()
    .min(1, "El slug es requerido")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  phone: z.string().optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  hours: z.record(z.string(), z.string()).default({}),
  isActive: z.boolean().default(true),
});

// ──────────────────────────────────────────────
// getStores
// ──────────────────────────────────────────────

export async function getStores() {
  await requireRole("ADMIN");

  const stores = await prisma.store.findMany({
    include: { storeHours: true },
    orderBy: { name: "asc" },
  });

  return stores;
}

// ──────────────────────────────────────────────
// getStore
// ──────────────────────────────────────────────

export async function getStore(id: string) {
  await requireRole("ADMIN");

  const store = await prisma.store.findUnique({
    where: { id },
    include: { storeHours: true },
  });

  return store;
}

// ──────────────────────────────────────────────
// createStore
// ──────────────────────────────────────────────

export async function createStore(
  input: z.infer<typeof StoreSchema>,
): Promise<{ success: true; id: string } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    const parsed = StoreSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    const data = parsed.data;

    const existing = await prisma.store.findUnique({ where: { slug: data.slug } });
    if (existing) {
      return { success: false, error: "Ya existe una sucursal con ese slug" };
    }

    const store = await prisma.store.create({
      data: {
        name: data.name,
        slug: data.slug,
        address: data.address,
        city: data.city,
        phone: data.phone ?? null,
        lat: data.lat,
        lng: data.lng,
        hours: data.hours,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/sucursales");
    return { success: true, id: store.id };
  } catch (error) {
    console.error("[admin.createStore] Error:", error);
    return { success: false, error: "Error al crear la sucursal" };
  }
}

// ──────────────────────────────────────────────
// updateStore
// ──────────────────────────────────────────────

export async function updateStore(
  id: string,
  input: z.infer<typeof StoreSchema>,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    const parsed = StoreSchema.safeParse(input);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      };
    }

    const data = parsed.data;

    const existing = await prisma.store.findFirst({
      where: { slug: data.slug, id: { not: id } },
    });
    if (existing) {
      return { success: false, error: "Ya existe otra sucursal con ese slug" };
    }

    await prisma.store.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        address: data.address,
        city: data.city,
        phone: data.phone ?? null,
        lat: data.lat,
        lng: data.lng,
        hours: data.hours,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/sucursales");
    return { success: true };
  } catch (error) {
    console.error("[admin.updateStore] Error:", error);
    return { success: false, error: "Error al actualizar la sucursal" };
  }
}

// ──────────────────────────────────────────────
// deleteStore
// ──────────────────────────────────────────────

export async function deleteStore(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireRole("ADMIN");

    const store = await prisma.store.findUnique({
      where: { id },
      include: { _count: { select: { storeHours: true } } },
    });

    if (!store) {
      return { success: false, error: "Sucursal no encontrada" };
    }

    await prisma.store.delete({ where: { id } });

    revalidatePath("/admin/sucursales");
    return { success: true };
  } catch (error) {
    console.error("[admin.deleteStore] Error:", error);
    return { success: false, error: "Error al eliminar la sucursal" };
  }
}
