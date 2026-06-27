import { z } from "zod";

// ──────────────────────────────────────────────
// Review
// ──────────────────────────────────────────────
export const ReviewSchema = z.object({
  productId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000).optional(),
});

export const ReviewUpdateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional(),
});

export const ReviewStatusSchema = z.enum(["pending", "approved", "rejected"]);

export type ReviewInput = z.infer<typeof ReviewSchema>;
export type ReviewUpdate = z.infer<typeof ReviewUpdateSchema>;
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;
