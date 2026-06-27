"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  AGE_FILTER_OPTIONS,
  EN13402_SIZES,
  type CategorySlug,
  type GenderFilter,
} from "@/lib/filters/types";

const CATEGORIES: { slug: CategorySlug; label: string }[] = [
  { slug: "casual", label: "Casual" },
  { slug: "arreglada", label: "Arreglada" },
  { slug: "deporte", label: "Deporte" },
];

const GENDERS: { value: GenderFilter; label: string }[] = [
  { value: "nino", label: "Niño" },
  { value: "nina", label: "Niña" },
  { value: "unisex", label: "Unisex" },
];

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({ isOpen, onClose }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("cursor");
      router.push(`/productos?${params.toString()}`);
    },
    [router, searchParams],
  );

  const activeCategory = searchParams.get("categoria") as CategorySlug | null;
  const activeGender = searchParams.get("genero") as GenderFilter;
  const activeSize = searchParams.get("talle");
  const priceMin = searchParams.get("precio_min");
  const priceMax = searchParams.get("precio_max");
  const activeAgeMin = searchParams.get("edad_min");

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-72 transform overflow-y-auto border-r border-brand-200 bg-white p-6 transition-transform duration-300 lg:static lg:z-auto lg:block lg:h-auto lg:w-64 lg:translate-x-0 lg:border-r lg:p-4 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="complementary"
        aria-label="Filtros de productos"
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <h2 className="text-sm font-medium uppercase tracking-wider text-brand-900">
            Filtros
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-brand-400 hover:bg-surface"
            aria-label="Cerrar filtros"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <fieldset className="mb-6">
          <legend className="mb-2 text-[10px] font-medium uppercase tracking-widest text-brand-400">
            Categoría
          </legend>
          <div className="space-y-1">
            <button
              onClick={() => updateParam("categoria", null)}
              className={`block w-full px-3 py-1.5 text-left text-xs transition ${
                !activeCategory
                  ? "bg-brand-100 font-medium text-brand-900"
                  : "text-brand-500 hover:bg-surface"
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => updateParam("categoria", cat.slug)}
                className={`block w-full px-3 py-1.5 text-left text-xs transition ${
                  activeCategory === cat.slug
                    ? "bg-brand-100 font-medium text-brand-900"
                    : "text-brand-500 hover:bg-surface"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-6">
          <legend className="mb-2 text-[10px] font-medium uppercase tracking-widest text-brand-400">
            Género
          </legend>
          <div className="space-y-1">
            <button
              onClick={() => updateParam("genero", null)}
              className={`block w-full px-3 py-1.5 text-left text-xs transition ${
                !activeGender
                  ? "bg-brand-100 font-medium text-brand-900"
                  : "text-brand-500 hover:bg-surface"
              }`}
            >
              Todos
            </button>
            {GENDERS.map((g) => (
              <button
                key={g.value}
                onClick={() => updateParam("genero", g.value)}
                className={`block w-full px-3 py-1.5 text-left text-xs transition ${
                  activeGender === g.value
                    ? "bg-brand-100 font-medium text-brand-900"
                    : "text-brand-500 hover:bg-surface"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-6">
          <legend className="mb-2 text-[10px] font-medium uppercase tracking-widest text-brand-400">
            Edad
          </legend>
          <div className="space-y-1">
            <button
              onClick={() => {
                updateParam("edad_min", null);
                updateParam("edad_max", null);
              }}
              className={`block w-full px-3 py-1.5 text-left text-xs transition ${
                !activeAgeMin
                  ? "bg-brand-100 font-medium text-brand-900"
                  : "text-brand-500 hover:bg-surface"
              }`}
            >
              Todas las edades
            </button>
            {AGE_FILTER_OPTIONS.slice(0, 8).map((age) => (
              <button
                key={age.label}
                onClick={() => {
                  updateParam("edad_min", String(age.heightMin));
                  updateParam("edad_max", String(age.heightMax));
                }}
                className={`block w-full px-3 py-1.5 text-left text-xs transition ${
                  activeAgeMin === String(age.heightMin)
                    ? "bg-brand-100 font-medium text-brand-900"
                    : "text-brand-500 hover:bg-surface"
                }`}
              >
                {age.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mb-6">
          <legend className="mb-2 text-[10px] font-medium uppercase tracking-widest text-brand-400">
            Precio
          </legend>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Desde"
              value={priceMin ?? ""}
              onChange={(e) => updateParam("precio_min", e.target.value || null)}
              className="w-full border border-brand-200 px-3 py-1.5 text-xs text-brand-900 placeholder:text-brand-400 focus:border-brand-900 focus:outline-none"
              min={0}
              aria-label="Precio mínimo"
            />
            <span className="self-center text-brand-300">—</span>
            <input
              type="number"
              placeholder="Hasta"
              value={priceMax ?? ""}
              onChange={(e) => updateParam("precio_max", e.target.value || null)}
              className="w-full border border-brand-200 px-3 py-1.5 text-xs text-brand-900 placeholder:text-brand-400 focus:border-brand-900 focus:outline-none"
              min={0}
              aria-label="Precio máximo"
            />
          </div>
        </fieldset>

        <fieldset className="mb-6">
          <legend className="mb-2 text-[10px] font-medium uppercase tracking-widest text-brand-400">
            Talle (EN 13402)
          </legend>
          <div className="grid grid-cols-5 gap-1">
            {EN13402_SIZES.map((size) => (
              <button
                key={size}
                onClick={() =>
                  updateParam("talle", activeSize === size ? null : size)
                }
                className={`px-2 py-1.5 text-center text-[11px] transition ${
                  activeSize === size
                    ? "bg-brand-900 text-white"
                    : "border border-brand-200 text-brand-500 hover:border-brand-900 hover:text-brand-900"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>
      </aside>
    </>
  );
}
