import type { SizeChart } from "../../schemas/product.schema.ts";

/**
 * EN 13402 size chart for sport / active wear.
 * Sport fit: relaxed, extra ease for movement.
 * Chest and hip measurements are +2 cm vs casual.
 * Waist is +1 cm vs casual for comfort during activity.
 */
export const sportSizeChart: SizeChart = {
  standard: "EN 13402",
  category: "sport",
  sizes: [
    // ── Newborn / Infant (0-24 months) ──
    { label: "50", heightMinCm: 45, heightMaxCm: 53, ageLabel: "0-1m", chestCm: 38, waistCm: 35, fitAdjustment: "+2cm" },
    { label: "56", heightMinCm: 53, heightMaxCm: 59, ageLabel: "1-3m", chestCm: 40, waistCm: 37, fitAdjustment: "+2cm" },
    { label: "62", heightMinCm: 59, heightMaxCm: 65, ageLabel: "3-6m", chestCm: 42, waistCm: 38, fitAdjustment: "+2cm" },
    { label: "68", heightMinCm: 65, heightMaxCm: 71, ageLabel: "6-9m", chestCm: 44, waistCm: 39, fitAdjustment: "+2cm" },
    { label: "74", heightMinCm: 71, heightMaxCm: 77, ageLabel: "9-12m", chestCm: 46, waistCm: 40, fitAdjustment: "+2cm" },
    { label: "80", heightMinCm: 77, heightMaxCm: 83, ageLabel: "12-18m", chestCm: 48, waistCm: 41, fitAdjustment: "+2cm" },
    { label: "86", heightMinCm: 83, heightMaxCm: 89, ageLabel: "18-24m", chestCm: 50, waistCm: 42, fitAdjustment: "+2cm" },

    // ── Toddler (2-4 years) ──
    { label: "92", heightMinCm: 89, heightMaxCm: 95, ageLabel: "2-3a", chestCm: 52, waistCm: 43, hipCm: 54, fitAdjustment: "+2cm" },
    { label: "98", heightMinCm: 95, heightMaxCm: 101, ageLabel: "3-4a", chestCm: 54, waistCm: 44, hipCm: 56, fitAdjustment: "+2cm" },

    // ── Child (4-8 years) ──
    { label: "104", heightMinCm: 101, heightMaxCm: 107, ageLabel: "4-5a", chestCm: 56, waistCm: 45, hipCm: 58, fitAdjustment: "+2cm" },
    { label: "110", heightMinCm: 107, heightMaxCm: 113, ageLabel: "5-6a", chestCm: 58, waistCm: 46, hipCm: 60, fitAdjustment: "+2cm" },
    { label: "116", heightMinCm: 113, heightMaxCm: 119, ageLabel: "6-7a", chestCm: 60, waistCm: 47, hipCm: 62, fitAdjustment: "+2cm" },
    { label: "122", heightMinCm: 119, heightMaxCm: 125, ageLabel: "7-8a", chestCm: 62, waistCm: 48, hipCm: 64, fitAdjustment: "+2cm" },

    // ── Pre-teen (8-14 years) ──
    { label: "128", heightMinCm: 125, heightMaxCm: 131, ageLabel: "8-9a", chestCm: 65, waistCm: 50, hipCm: 67, fitAdjustment: "+2cm" },
    { label: "134", heightMinCm: 131, heightMaxCm: 137, ageLabel: "9-10a", chestCm: 68, waistCm: 52, hipCm: 70, fitAdjustment: "+2cm" },
    { label: "140", heightMinCm: 137, heightMaxCm: 143, ageLabel: "10-11a", chestCm: 71, waistCm: 54, hipCm: 73, fitAdjustment: "+2cm" },
    { label: "146", heightMinCm: 143, heightMaxCm: 149, ageLabel: "11-12a", chestCm: 74, waistCm: 56, hipCm: 76, fitAdjustment: "+2cm" },
    { label: "152", heightMinCm: 149, heightMaxCm: 155, ageLabel: "12-13a", chestCm: 78, waistCm: 59, hipCm: 80, fitAdjustment: "+2cm" },
    { label: "158", heightMinCm: 155, heightMaxCm: 161, ageLabel: "13-14a", chestCm: 82, waistCm: 62, hipCm: 84, fitAdjustment: "+2cm" },
    { label: "164", heightMinCm: 161, heightMaxCm: 167, ageLabel: "14-15a", chestCm: 86, waistCm: 65, hipCm: 88, fitAdjustment: "+2cm" },
  ],
};
