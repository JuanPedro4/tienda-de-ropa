"use client";

import { useState, useCallback, type FormEvent } from "react";
import type { SizeChartCategory } from "@tienda/shared/schemas";
import type { SizeRecommendation } from "@tienda/shared/schemas";

interface SizeCalculatorProps {
  category: SizeChartCategory;
}

export default function SizeCalculator({ category }: SizeCalculatorProps) {
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [ageMonths, setAgeMonths] = useState("");
  const [result, setResult] = useState<SizeRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setResult(null);

      if (!heightCm) {
        setError("La altura es obligatoria");
        return;
      }

      const height = Number(heightCm);
      if (isNaN(height) || height < 40 || height > 200) {
        setError("La altura debe estar entre 40 y 200 cm");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/size-calculator", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            heightCm: height,
            weightKg: weightKg ? Number(weightKg) : undefined,
            ageMonths: ageMonths ? Number(ageMonths) : undefined,
            category,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? "Error al calcular el talle");
          return;
        }

        const data = await res.json();
        setResult(data as SizeRecommendation);
      } catch {
        setError("Error de conexión. Intenta de nuevo.");
      } finally {
        setIsLoading(false);
      }
    },
    [heightCm, weightKg, ageMonths, category],
  );

  const handleReset = useCallback(() => {
    setHeightCm("");
    setWeightKg("");
    setAgeMonths("");
    setResult(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium">¿No sabes qué talle elegir?</p>
        <p className="mt-1">
          Ingresa la altura de tu hijo/a y te recomendamos el talle ideal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="calc-height"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Altura <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="calc-height"
              type="number"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="Ej: 110"
              min={40}
              max={200}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-sm focus:border-primary-500 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              cm
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="calc-weight"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Peso <span className="text-gray-400">(opcional)</span>
          </label>
          <div className="relative">
            <input
              id="calc-weight"
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="Ej: 18"
              min={0}
              max={120}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-12 text-sm focus:border-primary-500 focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              kg
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="calc-age"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Edad <span className="text-gray-400">(opcional, en meses)</span>
          </label>
          <input
            id="calc-age"
            type="number"
            value={ageMonths}
            onChange={(e) => setAgeMonths(e.target.value)}
            placeholder="Ej: 60 (5 años)"
            min={0}
            max={180}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 rounded-lg bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Calculando..." : "Calcular talle"}
          </button>
          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Limpiar
            </button>
          )}
        </div>
      </form>

      {/* Result */}
      {result && (
        <div className="rounded-xl border-2 border-primary-200 bg-primary-50 p-6">
          <p className="text-sm font-medium text-primary-700">
            Talle recomendado
          </p>
          <p className="mt-1 text-3xl font-bold text-primary-600">
            {result.recommendedSize}
          </p>
          <p className="mt-1 text-sm text-primary-600">
            Para altura de {result.heightRange[0]}–{result.heightRange[1]} cm
            {result.ageLabel ? ` (${result.ageLabel})` : ""}
          </p>

          {(result.measurements.chestCm ||
            result.measurements.waistCm ||
            result.measurements.hipCm) && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              {result.measurements.chestCm && (
                <div className="rounded-lg bg-white p-2 text-center">
                  <p className="text-xs text-gray-500">Pecho</p>
                  <p className="font-semibold">{result.measurements.chestCm} cm</p>
                </div>
              )}
              {result.measurements.waistCm && (
                <div className="rounded-lg bg-white p-2 text-center">
                  <p className="text-xs text-gray-500">Cintura</p>
                  <p className="font-semibold">{result.measurements.waistCm} cm</p>
                </div>
              )}
              {result.measurements.hipCm && (
                <div className="rounded-lg bg-white p-2 text-center">
                  <p className="text-xs text-gray-500">Cadera</p>
                  <p className="font-semibold">{result.measurements.hipCm} cm</p>
                </div>
              )}
            </div>
          )}

          {result.alternatives && result.alternatives.length > 0 && (
            <p className="mt-3 text-xs text-primary-600">
              Alternativas:{" "}
              {result.alternatives.join(", ")}
            </p>
          )}

          {result.fitNote && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              {result.fitNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
