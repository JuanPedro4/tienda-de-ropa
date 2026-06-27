import { z } from "zod";

// ──────────────────────────────────────────────
// Size calculator input
// ──────────────────────────────────────────────
export const SizeCalculatorInputSchema = z.object({
  heightCm: z.number().positive().max(200),
  weightKg: z.number().positive().max(120).optional(),
  ageMonths: z.number().int().min(0).max(180).optional(),
  category: z.enum(["casual", "formal", "sport"]).default("casual"),
});

export const SizeRecommendationSchema = z.object({
  recommendedSize: z.string(),
  heightRange: z.tuple([z.number(), z.number()]),
  ageLabel: z.string(),
  measurements: z.object({
    chestCm: z.number().optional(),
    waistCm: z.number().optional(),
    hipCm: z.number().optional(),
  }),
  alternatives: z.array(z.string()).optional(),
  fitNote: z.string().optional(),
});

export type SizeCalculatorInput = z.infer<typeof SizeCalculatorInputSchema>;
export type SizeRecommendation = z.infer<typeof SizeRecommendationSchema>;
