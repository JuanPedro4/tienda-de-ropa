import type { SizeChart } from "../../schemas/product.schema.ts";

/**
 * EN 13402 size chart for formal / dressy wear.
 * Formal fit: closer to body, more tailored silhouette.
 * Chest and waist measurements follow a more fitted cut —
 * the upper-end of the range is slightly tighter than casual.
 */
export const formalSizeChart: SizeChart = {
  standard: "EN 13402",
  category: "formal",
  sizes: [
    // ── Newborn / Infant (0-24 months) ──
    { label: "50", heightMinCm: 45, heightMaxCm: 53, ageLabel: "0-1m", chestCm: 35, waistCm: 33 },
    { label: "56", heightMinCm: 53, heightMaxCm: 59, ageLabel: "1-3m", chestCm: 37, waistCm: 35 },
    { label: "62", heightMinCm: 59, heightMaxCm: 65, ageLabel: "3-6m", chestCm: 39, waistCm: 36 },
    { label: "68", heightMinCm: 65, heightMaxCm: 71, ageLabel: "6-9m", chestCm: 41, waistCm: 37 },
    { label: "74", heightMinCm: 71, heightMaxCm: 77, ageLabel: "9-12m", chestCm: 43, waistCm: 38 },
    { label: "80", heightMinCm: 77, heightMaxCm: 83, ageLabel: "12-18m", chestCm: 45, waistCm: 39 },
    { label: "86", heightMinCm: 83, heightMaxCm: 89, ageLabel: "18-24m", chestCm: 47, waistCm: 40 },

    // ── Toddler (2-4 years) ──
    { label: "92", heightMinCm: 89, heightMaxCm: 95, ageLabel: "2-3a", chestCm: 49, waistCm: 41, hipCm: 51 },
    { label: "98", heightMinCm: 95, heightMaxCm: 101, ageLabel: "3-4a", chestCm: 51, waistCm: 42, hipCm: 53 },

    // ── Child (4-8 years) ──
    { label: "104", heightMinCm: 101, heightMaxCm: 107, ageLabel: "4-5a", chestCm: 53, waistCm: 43, hipCm: 55 },
    { label: "110", heightMinCm: 107, heightMaxCm: 113, ageLabel: "5-6a", chestCm: 55, waistCm: 44, hipCm: 57 },
    { label: "116", heightMinCm: 113, heightMaxCm: 119, ageLabel: "6-7a", chestCm: 57, waistCm: 45, hipCm: 59 },
    { label: "122", heightMinCm: 119, heightMaxCm: 125, ageLabel: "7-8a", chestCm: 59, waistCm: 46, hipCm: 61 },

    // ── Pre-teen (8-14 years) ──
    { label: "128", heightMinCm: 125, heightMaxCm: 131, ageLabel: "8-9a", chestCm: 62, waistCm: 48, hipCm: 64 },
    { label: "134", heightMinCm: 131, heightMaxCm: 137, ageLabel: "9-10a", chestCm: 65, waistCm: 50, hipCm: 67 },
    { label: "140", heightMinCm: 137, heightMaxCm: 143, ageLabel: "10-11a", chestCm: 68, waistCm: 52, hipCm: 70 },
    { label: "146", heightMinCm: 143, heightMaxCm: 149, ageLabel: "11-12a", chestCm: 71, waistCm: 54, hipCm: 73 },
    { label: "152", heightMinCm: 149, heightMaxCm: 155, ageLabel: "12-13a", chestCm: 75, waistCm: 57, hipCm: 77 },
    { label: "158", heightMinCm: 155, heightMaxCm: 161, ageLabel: "13-14a", chestCm: 79, waistCm: 60, hipCm: 81 },
    { label: "164", heightMinCm: 161, heightMaxCm: 167, ageLabel: "14-15a", chestCm: 83, waistCm: 63, hipCm: 85 },
  ],
};
