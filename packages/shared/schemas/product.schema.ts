import { z } from "zod";

// ──────────────────────────────────────────────
// Size chart schema (EN 13402)
// ──────────────────────────────────────────────
export const SizeChartCategorySchema = z.enum(["casual", "formal", "sport"]);

export const SizeEntrySchema = z.object({
  label: z.string(),
  heightMinCm: z.number().positive(),
  heightMaxCm: z.number().positive(),
  ageLabel: z.string(),
  chestCm: z.number().positive().optional(),
  waistCm: z.number().positive().optional(),
  hipCm: z.number().positive().optional(),
  fitAdjustment: z.string().optional(),
});

export const SizeChartSchema = z.object({
  standard: z.literal("EN 13402"),
  category: SizeChartCategorySchema,
  sizes: z.array(SizeEntrySchema).min(1),
});

export type SizeChartCategory = z.infer<typeof SizeChartCategorySchema>;
export type SizeEntry = z.infer<typeof SizeEntrySchema>;
export type SizeChart = z.infer<typeof SizeChartSchema>;

// ──────────────────────────────────────────────
// Certification
// ──────────────────────────────────────────────
export const CertificationSchema = z.object({
  name: z.string().min(1).max(100),
  badge: z.string().url().optional(),
});

export type Certification = z.infer<typeof CertificationSchema>;

// ──────────────────────────────────────────────
// Product
// ──────────────────────────────────────────────
export const ProductSchema = z.object({
  title: z.string().min(2).max(120),
  subtitle: z.string().max(200).optional(),
  description: z.string().min(10).max(5000),
  handle: z.string().regex(/^[a-z0-9-]+$/),
  categoryId: z.string().uuid(),
  material: z.string().optional(),
  originCountry: z.string().optional(),
  sizeChart: SizeChartSchema.optional(),
  certifications: z.array(CertificationSchema).optional(),
  images: z.array(z.string().url()).min(1).max(10),
});

export const ProductUpdateSchema = ProductSchema.partial();

export type ProductInput = z.infer<typeof ProductSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
