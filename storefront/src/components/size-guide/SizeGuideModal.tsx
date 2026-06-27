"use client";

import { useState, useCallback } from "react";
import { sizeCharts } from "@tienda/shared/data/size-charts";
import type { SizeChart, SizeChartCategory } from "@tienda/shared/schemas";
import SizeCalculator from "./SizeCalculator";

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: SizeChartCategory;
}

const CATEGORIES: { key: SizeChartCategory; label: string }[] = [
  { key: "casual", label: "Casual" },
  { key: "formal", label: "Arreglada" },
  { key: "sport", label: "Deporte" },
];

export default function SizeGuideModal({
  isOpen,
  onClose,
  initialCategory = "casual",
}: SizeGuideModalProps) {
  const [activeTab, setActiveTab] = useState<SizeChartCategory>(initialCategory);
  const [showCalculator, setShowCalculator] = useState(false);
  const chart: SizeChart = sizeCharts[activeTab];

  const handlePrint = useCallback(() => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const allCharts = sizeCharts;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Guía de Talles - Tienda Ropa Infantil</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 2rem; }
          h1 { font-size: 1.5rem; margin-bottom: 1rem; }
          h2 { font-size: 1.25rem; margin-top: 2rem; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
          th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: center; }
          th { background: #f5f5f5; font-weight: 600; }
          .category { color: #db2777; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>Guía de Talles EN 13402</h1>
        <p>Ropa infantil — Talles 50 a 164 cm</p>
        ${Object.entries(allCharts).map(([category, catChart]) => `
          <h2 class="category">${CATEGORIES.find(c => c.key === category)?.label ?? category}</h2>
          <table>
            <thead>
              <tr>
                <th>Talle</th>
                <th>Altura (cm)</th>
                <th>Edad</th>
                <th>Pecho (cm)</th>
                <th>Cintura (cm)</th>
                <th>Cadera (cm)</th>
              </tr>
            </thead>
            <tbody>
              ${catChart.sizes.map(size => `
                <tr>
                  <td><strong>${size.label}</strong></td>
                  <td>${size.heightMinCm}-${size.heightMaxCm}</td>
                  <td>${size.ageLabel}</td>
                  <td>${size.chestCm ?? '-'}</td>
                  <td>${size.waistCm ?? '-'}</td>
                  <td>${size.hipCm ?? '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `).join('')}
        <p style="margin-top: 2rem; font-size: 0.875rem; color: #666;">
          Basado en la norma EN 13402. Las medidas son orientativas.
        </p>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Guía de Talles
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              aria-label="Versión imprimible"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100"
              aria-label="Cerrar"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Tabs */}
          <div className="mb-6 flex border-b border-gray-200">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setActiveTab(cat.key);
                  setShowCalculator(false);
                }}
                className={`px-4 py-2.5 text-sm font-medium transition ${
                  activeTab === cat.key
                    ? "border-b-2 border-primary-500 text-primary-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className={`ml-auto px-4 py-2.5 text-sm font-medium transition ${
                showCalculator
                  ? "border-b-2 border-primary-500 text-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Calculadora
            </button>
          </div>

          {/* Calculator */}
          {showCalculator ? (
            <SizeCalculator category={activeTab} />
          ) : (
            <>
              {/* Size table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="pb-2 pr-4 font-semibold text-gray-900">Talle</th>
                      <th className="pb-2 pr-4 font-semibold text-gray-900">Altura (cm)</th>
                      <th className="pb-2 pr-4 font-semibold text-gray-900">Edad</th>
                      <th className="pb-2 pr-4 font-semibold text-gray-900">Pecho (cm)</th>
                      <th className="pb-2 pr-4 font-semibold text-gray-900">Cintura (cm)</th>
                      <th className="pb-2 font-semibold text-gray-900">Cadera (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chart.sizes.map((size) => (
                      <tr
                        key={size.label}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="py-2.5 pr-4 font-medium text-gray-900">
                          {size.label}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600">
                          {size.heightMinCm}–{size.heightMaxCm}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600">
                          {size.ageLabel}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600">
                          {size.chestCm ?? "—"}
                        </td>
                        <td className="py-2.5 pr-4 text-gray-600">
                          {size.waistCm ?? "—"}
                        </td>
                        <td className="py-2.5 text-gray-600">
                          {size.hipCm ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-4 text-xs text-gray-400">
                Basado en la norma <strong>EN 13402</strong>. Las medidas son orientativas.
                {chart.sizes[0]?.fitAdjustment && (
                  <> {chart.sizes[0].fitAdjustment}</>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
