import type { SizeChart } from "../../schemas/product.schema";

/**
 * EN 13402 size chart for casual wear.
 * Casual fit: regular ease, standard measurements.
 * Suitable for daily wear, play, and general use.
 */
export const casualSizeChart: SizeChart = {
  standard: "EN 13402",
  category: "casual",
  sizes: [
    // ── Newborn / Infant (0-24 months) ──
    { label: "50", heightMinCm: 45, heightMaxCm: 53, ageLabel: "0-1m", chestCm: 36, waistCm: 34 },
    { label: "56", heightMinCm: 53, heightMaxCm: 59, ageLabel: "1-3m", chestCm: 38, waistCm: 36 },
    { label: "62", heightMinCm: 59, heightMaxCm: 65, ageLabel: "3-6m", chestCm: 40, waistCm: 37 },
    { label: "68", heightMinCm: 65, heightMaxCm: 71, ageLabel: "6-9m", chestCm: 42, waistCm: 38 },
    { label: "74", heightMinCm: 71, heightMaxCm: 77, ageLabel: "9-12m", chestCm: 44, waistCm: 39 },
    { label: "80", heightMinCm: 77, heightMaxCm: 83, ageLabel: "12-18m", chestCm: 46, waistCm: 40 },
    { label: "86", heightMinCm: 83, heightMaxCm: 89, ageLabel: "18-24m", chestCm: 48, waistCm: 41 },

    // ── Toddler (2-4 years) ──
    { label: "92", heightMinCm: 89, heightMaxCm: 95, ageLabel: "2-3a", chestCm: 50, waistCm: 42, hipCm: 52 },
    { label: "98", heightMinCm: 95, heightMaxCm: 101, ageLabel: "3-4a", chestCm: 52, waistCm: 43, hipCm: 54 },

    // ── Child (4-8 years) ──
    { label: "104", heightMinCm: 101, heightMaxCm: 107, ageLabel: "4-5a", chestCm: 54, waistCm: 44, hipCm: 56 },
    { label: "110", heightMinCm: 107, heightMaxCm: 113, ageLabel: "5-6a", chestCm: 56, waistCm: 45, hipCm: 58 },
    { label: "116", heightMinCm: 113, heightMaxCm: 119, ageLabel: "6-7a", chestCm: 58, waistCm: 46, hipCm: 60 },
    { label: "122", heightMinCm: 119, heightMaxCm: 125, ageLabel: "7-8a", chestCm: 60, waistCm: 47, hipCm: 62 },

    // ── Pre-teen (8-14 years) ──
    { label: "128", heightMinCm: 125, heightMaxCm: 131, ageLabel: "8-9a", chestCm: 63, waistCm: 49, hipCm: 65 },
    { label: "134", heightMinCm: 131, heightMaxCm: 137, ageLabel: "9-10a", chestCm: 66, waistCm: 51, hipCm: 68 },
    { label: "140", heightMinCm: 137, heightMaxCm: 143, ageLabel: "10-11a", chestCm: 69, waistCm: 53, hipCm: 71 },
    { label: "146", heightMinCm: 143, heightMaxCm: 149, ageLabel: "11-12a", chestCm: 72, waistCm: 55, hipCm: 74 },
    { label: "152", heightMinCm: 149, heightMaxCm: 155, ageLabel: "12-13a", chestCm: 76, waistCm: 58, hipCm: 78 },
    { label: "158", heightMinCm: 155, heightMaxCm: 161, ageLabel: "13-14a", chestCm: 80, waistCm: 61, hipCm: 82 },
    { label: "164", heightMinCm: 161, heightMaxCm: 167, ageLabel: "14-15a", chestCm: 84, waistCm: 64, hipCm: 86 },
  ],
};
