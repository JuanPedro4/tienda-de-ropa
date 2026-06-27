import { NextResponse } from "next/server";
import {
  SizeCalculatorInputSchema,
} from "@tienda/shared/schemas";
import {
  getSizeChart,
  findSizeByHeight,
  sizeCharts,
} from "@tienda/shared/data/size-charts";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = SizeCalculatorInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const { heightCm, weightKg, ageMonths, category } = parsed.data;

    // Find size by height
    const recommendedSize = findSizeByHeight(heightCm, category);

    // Get chart for additional context
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

    // Adjust for weight if provided
    let fitNote: string | undefined;
    if (weightKg && sizeEntry) {
      const avgWeightForHeight = heightCm * 0.3; // rough estimate
      if (weightKg > avgWeightForHeight * 1.2) {
        fitNote =
          "El peso está por encima del promedio para esta altura. Recomendamos elegir un talle más grande para mayor comodidad.";
      } else if (weightKg < avgWeightForHeight * 0.8) {
        fitNote =
          "El peso está por debajo del promedio para esta altura. Recomendamos probar el talle recomendado y uno más pequeño.";
      }
    }

    // Age-based note
    if (ageMonths && sizeEntry) {
      const ageYears = Math.round(ageMonths / 12);
      const sizeAge = parseInt(sizeEntry.ageLabel.replace(/[^0-9]/g, ""), 10);
      if (!isNaN(sizeAge) && Math.abs(ageYears - sizeAge) > 2) {
        fitNote = fitNote
          ? `${fitNote} Además, la altura no corresponde con la edad típica para este talle.`
          : "La altura no corresponde con la edad típica para este talle. Guíate por la altura principalmente.";
      }
    }

    return NextResponse.json({
      recommendedSize,
      heightRange: [sizeEntry?.heightMinCm, sizeEntry?.heightMaxCm] as [
        number,
        number,
      ],
      ageLabel: sizeEntry?.ageLabel ?? "",
      measurements: {
        chestCm: sizeEntry?.chestCm,
        waistCm: sizeEntry?.waistCm,
        hipCm: sizeEntry?.hipCm,
      },
      alternatives: alternatives.length > 0 ? alternatives : undefined,
      fitNote,
    });
  } catch (error) {
    console.error("Size calculator error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 },
    );
  }
}

export async function GET() {
  // Return all size charts for the printable version
  const charts = {
    casual: sizeCharts.casual,
    formal: sizeCharts.formal,
    sport: sizeCharts.sport,
  };

  return NextResponse.json(charts);
}
