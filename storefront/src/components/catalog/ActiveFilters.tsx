"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

const FILTER_LABELS: Record<string, Record<string, string>> = {
  categoria: { casual: "Casual", arreglada: "Arreglada", deporte: "Deporte" },
  edad: { "0-3": "0–3 años", "3-7": "3–7 años", "7-10": "7–10 años", "10-14": "10–14 años" },
};

export default function ActiveFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const removeFilter = useCallback(
    (key: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(key);
      router.push(`/productos?${params.toString()}`);
    },
    [router, searchParams],
  );

  const filters: { key: string; value: string; label: string }[] = [];

  for (const [key, value] of searchParams.entries()) {
    if (key === "q") {
      filters.push({ key, value, label: `"${value}"` });
    } else if (key === "sort" && value !== "newest") {
      const sortLabels: Record<string, string> = {
        price_asc: "Menor precio",
        price_desc: "Mayor precio",
        vistos: "Más vistos",
      };
      if (sortLabels[value]) {
        filters.push({ key, value, label: sortLabels[value] });
      }
    } else if (FILTER_LABELS[key]?.[value]) {
      filters.push({ key, value, label: FILTER_LABELS[key][value] });
    }
  }

  if (filters.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-medium uppercase tracking-wider text-brand-400">
        Filtros:
      </span>
      {filters.map((f) => (
        <span
          key={`${f.key}-${f.value}`}
          className="inline-flex items-center gap-1 border border-brand-200 px-2 py-1 text-[10px] uppercase tracking-wider text-brand-600"
        >
          {f.label}
          <button
            onClick={() => removeFilter(f.key)}
            className="ml-0.5 text-brand-400 hover:text-brand-900"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}
