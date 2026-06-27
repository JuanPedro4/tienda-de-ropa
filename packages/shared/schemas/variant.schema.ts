import { z } from "zod";

// ──────────────────────────────────────────────
// Product Variant
// ──────────────────────────────────────────────
export const VariantSchema = z.object({
  productId: z.string().uuid(),
  sku: z.string().min(3).max(50),
  title: z.string().min(2).max(100),
  size: z.string(),
  color: z.string().optional(),
  price: z.number().positive(),
  inventoryQuantity: z.number().int().min(0),
  allowBackorder: z.boolean().default(false),
});

export const VariantUpdateSchema = VariantSchema.partial();

export type VariantInput = z.infer<typeof VariantSchema>;
export type VariantUpdate = z.infer<typeof VariantUpdateSchema>;
