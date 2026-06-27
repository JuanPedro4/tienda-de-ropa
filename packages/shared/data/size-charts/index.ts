export { casualSizeChart } from "./casual";
export { formalSizeChart } from "./formal";
export { sportSizeChart } from "./sport";

import { casualSizeChart } from "./casual";
import { formalSizeChart } from "./formal";
import { sportSizeChart } from "./sport";
import type { SizeChartCategory, SizeChart } from "../../schemas/product.schema";

/**
 * Map of all size charts by category.
 */
export const sizeCharts: Record<SizeChartCategory, SizeChart> = {
  casual: casualSizeChart,
  formal: formalSizeChart,
  sport: sportSizeChart,
};

/**
 * Get the size chart for a given category.
 */
export function getSizeChart(category: SizeChartCategory): SizeChart {
  const chart = sizeCharts[category];
  if (!chart) {
    throw new Error(`Unknown size chart category: ${category}`);
  }
  return chart;
}

/**
 * Find the recommended size for a given height in cm.
 * Returns the size whose height range contains the given height.
 * Falls back to the nearest size.
 */
export function findSizeByHeight(heightCm: number, category: SizeChartCategory): string {
  const chart = getSizeChart(category);
  const exact = chart.sizes.find(
    (s) => heightCm >= s.heightMinCm && heightCm <= s.heightMaxCm,
  );
  if (exact) return exact.label;

  // Fallback: nearest size by midpoint
  let nearest = chart.sizes[0]!;
  let minDiff = Infinity;
  for (const s of chart.sizes) {
    const mid = (s.heightMinCm + s.heightMaxCm) / 2;
    const diff = Math.abs(heightCm - mid);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = s;
    }
  }
  return nearest.label;
}
