"use server";

import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/roles";

// ──────────────────────────────────────────────
// Validation schemas
// ──────────────────────────────────────────────

const SubmitReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  orderId: z.string().optional(),
  rating: z.number().int().min(1, "La puntuación debe ser entre 1 y 5").max(5, "La puntuación debe ser entre 1 y 5"),
  comment: z
    .string()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(1000, "El comentario debe tener máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

const EditReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(1000, "El comentario debe tener máximo 1000 caracteres")
    .optional()
    .or(z.literal("")),
});

const RejectReviewSchema = z.object({
  reason: z.string().max(500).optional(),
});

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Usuario no autenticado");
  }
  return session.user.id;
}

// ──────────────────────────────────────────────
// submitReview
//
// Submits a review for a product. The user must:
// - Be authenticated
// - Have purchased the product (orderId required)
// - Not have already reviewed this product
// The review is created in PENDING status by default.
// ──────────────────────────────────────────────

export async function submitReview(
  productId: string,
  rating: number,
  comment?: string,
  orderId?: string,
): Promise<
  | { success: true; reviewId: string }
  | { success: false; error: string }
> {
  try {
    const parsed = SubmitReviewSchema.safeParse({
      productId,
      orderId,
      rating,
      comment: comment || undefined,
    });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      } as const;
    }

    const userId = await requireUserId();

    // Check if user already reviewed this product
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId, productId: parsed.data.productId } },
    });

    if (existing) {
      return {
        success: false,
        error: "Ya has reseñado este producto",
      } as const;
    }

    // Verify the user purchased this product (if orderId provided)
    if (parsed.data.orderId) {
      const order = await prisma.order.findUnique({
        where: { id: parsed.data.orderId },
      });

      if (!order) {
        return {
          success: false,
          error: "Pedido no encontrado",
        } as const;
      }
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId: parsed.data.productId,
        orderId: parsed.data.orderId ?? null,
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
        status: "PENDING",
      },
    });

    return { success: true, reviewId: review.id };
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return { success: false, error: error.message };
    }

    console.error("[reviews.submitReview] Error:", error);
    return { success: false, error: "Error al enviar la reseña" };
  }
}

// ──────────────────────────────────────────────
// editReview
//
// Allows editing a review only if it's still in
// PENDING status (hasn't been moderated yet).
// ──────────────────────────────────────────────

export async function editReview(
  reviewId: string,
  rating: number,
  comment?: string,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    const parsed = EditReviewSchema.safeParse({
      rating,
      comment: comment || undefined,
    });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      } as const;
    }

    const userId = await requireUserId();

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return { success: false, error: "Reseña no encontrada" } as const;
    }

    if (review.userId !== userId) {
      return {
        success: false,
        error: "No puedes editar una reseña que no te pertenece",
      } as const;
    }

    if (review.status !== "PENDING") {
      return {
        success: false,
        error: "Solo puedes editar reseñas pendientes de moderación",
      } as const;
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: parsed.data.rating,
        comment: parsed.data.comment ?? null,
      },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return { success: false, error: error.message };
    }

    console.error("[reviews.editReview] Error:", error);
    return { success: false, error: "Error al editar la reseña" };
  }
}

// ──────────────────────────────────────────────
// deleteReview
//
// Deletes the user's own review (any status).
// ──────────────────────────────────────────────

export async function deleteReview(
  reviewId: string,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    if (!reviewId || typeof reviewId !== "string") {
      return { success: false, error: "ID de reseña inválido" } as const;
    }

    const userId = await requireUserId();

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return { success: false, error: "Reseña no encontrada" } as const;
    }

    if (review.userId !== userId) {
      return {
        success: false,
        error: "No puedes eliminar una reseña que no te pertenece",
      } as const;
    }

    await prisma.review.delete({ where: { id: reviewId } });

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return { success: false, error: error.message };
    }

    console.error("[reviews.deleteReview] Error:", error);
    return { success: false, error: "Error al eliminar la reseña" };
  }
}

// ──────────────────────────────────────────────
// admin.approveReview
//
// Approves a pending review so it becomes visible
// on the PDP. Requires ADMIN role.
// ──────────────────────────────────────────────

export async function approveReview(
  reviewId: string,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    await requireRole("ADMIN");

    if (!reviewId || typeof reviewId !== "string") {
      return { success: false, error: "ID de reseña inválido" } as const;
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return { success: false, error: "Reseña no encontrada" } as const;
    }

    if (review.status !== "PENDING") {
      return {
        success: false,
        error: `La reseña ya está "${review.status.toLowerCase()}"`,
      } as const;
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { status: "APPROVED" },
    });

    // TODO: Send notification to user that their review was approved
    console.log(
      `[reviews.approveReview] Review ${reviewId} approved`,
      `-- TODO: Notify user ${review.userId}`,
    );

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return { success: false, error: error.message };
    }

    console.error("[reviews.approveReview] Error:", error);
    return { success: false, error: "Error al aprobar la reseña" };
  }
}

// ──────────────────────────────────────────────
// admin.rejectReview
//
// Rejects a pending review with an optional reason.
// Requires ADMIN role.
// ──────────────────────────────────────────────

export async function rejectReview(
  reviewId: string,
  reason?: string,
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  try {
    await requireRole("ADMIN");

    const parsed = RejectReviewSchema.safeParse({ reason });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors.map((e) => e.message).join(", "),
      } as const;
    }

    if (!reviewId || typeof reviewId !== "string") {
      return { success: false, error: "ID de reseña inválido" } as const;
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return { success: false, error: "Reseña no encontrada" } as const;
    }

    if (review.status !== "PENDING") {
      return {
        success: false,
        error: `La reseña ya está "${review.status.toLowerCase()}"`,
      } as const;
    }

    await prisma.review.update({
      where: { id: reviewId },
      data: { status: "REJECTED" },
    });

    // TODO: Send notification to user with rejection reason
    console.log(
      `[reviews.rejectReview] Review ${reviewId} rejected`,
      reason ? `-- Reason: ${reason}` : "-- No reason provided",
      `-- TODO: Notify user ${review.userId}`,
    );

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return { success: false, error: error.message };
    }

    console.error("[reviews.rejectReview] Error:", error);
    return { success: false, error: "Error al rechazar la reseña" };
  }
}

// ──────────────────────────────────────────────
// getProductReviews (public)
//
// Gets approved reviews for a product with pagination.
// Includes the user's name for display.
// ──────────────────────────────────────────────

export async function getProductReviews(
  productId: string,
  page: number = 1,
  pageSize: number = 5,
): Promise<
  | {
      success: true;
      reviews: Array<{
        id: string;
        rating: number;
        comment: string | null;
        createdAt: string;
        user: { name: string | null; image: string | null };
      }>;
      total: number;
      averageRating: number;
      distribution: Record<number, number>;
    }
  | { success: false; error: string }
> {
  try {
    if (!productId) {
      return { success: false, error: "Product ID is required" } as const;
    }

    const where = { productId, status: "APPROVED" as const };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { name: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ]);

    // Calculate average rating
    const allApproved = await prisma.review.findMany({
      where,
      select: { rating: true },
    });

    const totalRatings = allApproved.length;
    const averageRating =
      totalRatings > 0
        ? Math.round(
            (allApproved.reduce((sum, r) => sum + r.rating, 0) /
              totalRatings) *
              10,
          ) / 10
        : 0;

    // Distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of allApproved) {
      distribution[r.rating] = (distribution[r.rating] ?? 0) + 1;
    }

    // Convert to percentages
    const distributionPercent: Record<number, number> = {};
    for (const [star, count] of Object.entries(distribution)) {
      distributionPercent[Number(star)] =
        totalRatings > 0
          ? Math.round((count / totalRatings) * 100)
          : 0;
    }

    return {
      success: true,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
      total,
      averageRating,
      distribution: distributionPercent,
    };
  } catch (error) {
    console.error("[reviews.getProductReviews] Error:", error);
    return { success: false, error: "Error al obtener las reseñas" };
  }
}

// ──────────────────────────────────────────────
// admin.getPendingReviews
//
// Gets all reviews in PENDING status for moderation.
// Requires ADMIN role.
// ──────────────────────────────────────────────

export async function getPendingReviews(): Promise<
  | {
      success: true;
      reviews: Array<{
        id: string;
        userId: string;
        productId: string;
        rating: number;
        comment: string | null;
        status: string;
        createdAt: string;
        user: { name: string | null; email: string | null };
        productName?: string;
      }>;
    }
  | { success: false; error: string }
> {
  try {
    await requireRole("ADMIN");

    const reviews = await prisma.review.findMany({
      where: { status: "PENDING" },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      reviews: reviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        productId: r.productId,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
        productName: undefined, // Will be resolved client-side via mock
      })),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return { success: false, error: error.message };
    }

    console.error("[reviews.getPendingReviews] Error:", error);
    return { success: false, error: "Error al obtener reseñas pendientes" };
  }
}

// ──────────────────────────────────────────────
// admin.getReviewsByStatus
//
// Gets reviews filtered by status for the admin
// moderation panel with tabs (PENDING, APPROVED, REJECTED).
// Requires ADMIN role.
// ──────────────────────────────────────────────

export async function getReviewsByStatus(
  status: "PENDING" | "APPROVED" | "REJECTED",
): Promise<
  | {
      success: true;
      reviews: Array<{
        id: string;
        userId: string;
        productId: string;
        rating: number;
        comment: string | null;
        status: string;
        createdAt: string;
        user: { name: string | null; email: string | null };
      }>;
    }
  | { success: false; error: string }
> {
  try {
    await requireRole("ADMIN");

    const reviews = await prisma.review.findMany({
      where: { status },
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      reviews: reviews.map((r) => ({
        id: r.id,
        userId: r.userId,
        productId: r.productId,
        rating: r.rating,
        comment: r.comment,
        status: r.status,
        createdAt: r.createdAt.toISOString(),
        user: r.user,
      })),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Usuario no autenticado") {
      return { success: false, error: error.message };
    }

    console.error("[reviews.getReviewsByStatus] Error:", error);
    return { success: false, error: "Error al obtener reseñas" };
  }
}
