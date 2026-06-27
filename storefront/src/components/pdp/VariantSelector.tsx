"use client";

import { useState, useCallback } from "react";
import StockBadge from "./StockBadge";

interface VariantPrice {
  amount: number;
  currencyCode: string;
}

interface Variant {
  id: string;
  sku: string;
  title: string;
  inventoryQuantity: number;
  allowBackorder?: boolean;
  options: { name: string; value: string }[];
  prices: VariantPrice[];
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId: string | null;
  onSelectVariant: (variantId: string) => void;
  onOpenSizeGuide?: () => void;
}

function formatPrice(amount: number, currency: string): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

export default function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  onOpenSizeGuide,
}: VariantSelectorProps) {
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  const sizeOptions = variants
    .map((v) => ({
      size: v.title,
      variantId: v.id,
      inStock: v.inventoryQuantity > 0 || v.allowBackorder,
    }))
    .sort((a, b) => {
      const aNum = parseInt(a.size, 10);
      const bNum = parseInt(b.size, 10);
      return (isNaN(aNum) ? 0 : aNum) - (isNaN(bNum) ? 0 : bNum);
    });

  const hasColor = variants.some((v) =>
    v.options.some((o) => o.name.toLowerCase() === "color"),
  );

  const colorOptions = hasColor
    ? [...new Set(variants.map((v) => v.options.find((o) => o.name.toLowerCase() === "color")?.value).filter(Boolean))]
    : [];

  const handleSizeSelect = useCallback(
    (variantId: string) => {
      onSelectVariant(variantId);
    },
    [onSelectVariant],
  );

  const handleColorSelect = useCallback(
    (color: string) => {
      const match = variants.find((v) =>
        v.options.some((o) => o.name.toLowerCase() === "color" && o.value === color),
      );
      if (match) onSelectVariant(match.id);
    },
    [variants, onSelectVariant],
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-brand-900">Talle</label>
          <button
            type="button"
            onClick={() => onOpenSizeGuide?.()}
            className="text-xs font-medium text-brand-500 hover:text-brand-900"
          >
            Guía de talles
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((opt) => {
            const isSelected = opt.variantId === selectedVariantId;
            if (!opt.inStock) {
              return (
                <span
                  key={opt.variantId}
                  className="relative cursor-not-allowed border border-brand-200 px-4 py-2 text-sm text-brand-300"
                >
                  {opt.size}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-px w-full rotate-45 bg-brand-200" />
                  </span>
                </span>
              );
            }
            return (
              <button
                key={opt.variantId}
                onClick={() => handleSizeSelect(opt.variantId)}
                className={`border px-4 py-2 text-sm font-medium transition ${
                  isSelected
                    ? "border-brand-900 bg-brand-900 text-white"
                    : "border-brand-200 text-brand-600 hover:border-brand-900 hover:text-brand-900"
                }`}
              >
                {opt.size}
              </button>
            );
          })}
        </div>
      </div>

      {colorOptions.length > 1 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-900">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((color) => {
              const isSelected = selectedVariant?.options.some(
                (o) => o.name.toLowerCase() === "color" && o.value === color,
              );
              return (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color!)}
                  className={`border px-4 py-2 text-sm font-medium transition ${
                    isSelected
                      ? "border-brand-900 bg-brand-900 text-white"
                      : "border-brand-200 text-brand-600 hover:border-brand-900 hover:text-brand-900"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {selectedVariant && (
        <div className="flex items-center gap-3">
          <p className="text-2xl font-light text-brand-900">
            {formatPrice(
              selectedVariant.prices[0]?.amount ?? 0,
              selectedVariant.prices[0]?.currencyCode ?? "EUR",
            )}
          </p>
          <StockBadge
            inventoryQuantity={selectedVariant.inventoryQuantity}
            allowBackorder={selectedVariant.allowBackorder}
          />
        </div>
      )}
    </div>
  );
}
