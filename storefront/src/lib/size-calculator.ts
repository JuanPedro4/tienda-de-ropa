import {
  findSizeByHeight,
  getSizeChart,
} from "@tienda/shared/data/size-charts";
import type { SizeChartCategory, SizeRecommendation } from "@tienda/shared/schemas";

/**
 * Calculate the recommended size for a child based on height,
 * with optional weight and age adjustments.
 *
 * @param heightCm - Child's height in centimetres
 * @param category - Clothing category (casual, formal, sport)
 * @param weightKg - Optional weight in kilograms (triggers fit note)
 * @param ageMonths - Optional age in months (triggers age-based note)
 */
export function calculateSize(
  heightCm: number,
  category: SizeChartCategory = "casual",
  weightKg?: number,
  ageMonths?: number,
): SizeRecommendation {
  const recommendedSize = findSizeByHeight(heightCm, category);
  const chart = getSizeChart(category);
  const sizeEntry = chart.sizes.find((s) => s.label === recommendedSize);

  // Find alternatives (sizes one step up/down)
  const sizeIndex = chart.sizes.findIndex(
    (s) => s.label === recommendedSize,
  );
  const alternatives: string[] = [];
  if (sizeIndex > 0) {
    alternatives.push(chart.sizes[sizeIndex - 1]!.label);
  }
  if (sizeIndex < chart.sizes.length - 1) {
    alternatives.push(chart.sizes[sizeIndex + 1]!.label);
  }

  // Weight-based fit note
  let fitNote: string | undefined;
  if (weightKg !== undefined && sizeEntry) {
    const avgWeightForHeight = heightCm * 0.3;
    if (weightKg > avgWeightForHeight * 1.2) {
      fitNote =
        "El peso está por encima del promedio para esta altura. Recomendamos elegir un talle más grande para mayor comodidad.";
    } else if (weightKg < avgWeightForHeight * 0.8) {
      fitNote =
        "El peso está por debajo del promedio para esta altura. Recomendamos probar el talle recomendado y uno más pequeño.";
    }
  }

  // Age-based note
  if (ageMonths !== undefined && sizeEntry) {
    const ageYears = Math.round(ageMonths / 12);
    const sizeAge = parseInt(sizeEntry.ageLabel.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(sizeAge) && Math.abs(ageYears - sizeAge) > 2) {
      fitNote = fitNote
        ? `${fitNote} Además, la altura no corresponde con la edad típica para este talle.`
        : "La altura no corresponde con la edad típica para este talle. Guíate por la altura principalmente.";
    }
  }

  return {
    recommendedSize,
    heightRange: [
      sizeEntry?.heightMinCm ?? 0,
      sizeEntry?.heightMaxCm ?? 0,
    ],
    ageLabel: sizeEntry?.ageLabel ?? "",
    measurements: {
      chestCm: sizeEntry?.chestCm,
      waistCm: sizeEntry?.waistCm,
      hipCm: sizeEntry?.hipCm,
    },
    alternatives: alternatives.length > 0 ? alternatives : undefined,
    fitNote,
  };
}
