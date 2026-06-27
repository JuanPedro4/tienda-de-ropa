"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createProduct, updateProduct } from "@/lib/admin/products-actions";
import type { Category } from "@prisma/client";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface CategoryWithCount extends Category {
  _count: { products: number };
  parent: { id: string; name: string } | null;
  children: { id: string; name: string }[];
}

interface VariantEntry {
  key: string;
  sku: string;
  title: string;
  color: string;
  price: string;
  inventoryQuantity: string;
  allowBackorder: boolean;
}

interface ImageEntry {
  key: string;
  url: string;
  alt: string;
}

interface ProductFormData {
  title: string;
  handle: string;
  description: string;
  material: string;
  countryOfOrigin: string;
  categoryId: string;
  certifications: string[];
  images: ImageEntry[];
  variants: VariantEntry[];
}

interface ProductFormProps {
  categories: CategoryWithCount[];
  initialData?: {
    title: string;
    handle: string;
    description: string | null;
    material: string | null;
    countryOfOrigin: string | null;
    categoryId: string | null;
    certifications: string[];
    thumbnail: string | null;
    images: Array<{ url: string; alt?: string }>;
    variants: Array<{
      id: string;
      sku: string;
      title: string;
      color: string | null;
      price: number;
      currency: string;
      inventoryQuantity: number;
      allowBackorder: boolean;
    }>;
  };
  productId?: string;
}

const CERTIFICATIONS = [
  { value: "OEKO_TEX", label: "OEKO-TEX Standard 100" },
  { value: "GOTS", label: "GOTS (Global Organic Textile Standard)" },
  { value: "GOTS_ORGANIC", label: "GOTS Orgánico" },
  { value: "ECO_CERT", label: "ECOCERT" },
  { value: "FAIR_TRADE", label: "Fair Trade / Comercio Justo" },
  { value: "ISO_14001", label: "ISO 14001" },
];

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

let keyCounter = 0;
function nextKey(): string {
  keyCounter += 1;
  return `key-${keyCounter}`;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function ProductForm({ categories, initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const [form, setForm] = useState<ProductFormData>({
    title: initialData?.title ?? "",
    handle: initialData?.handle ?? "",
    description: initialData?.description ?? "",
    material: initialData?.material ?? "",
    countryOfOrigin: initialData?.countryOfOrigin ?? "",
    categoryId: initialData?.categoryId ?? "",
    certifications: initialData?.certifications ?? [],
    images:
      initialData?.images?.map((img) => ({
        key: nextKey(),
        url: img.url,
        alt: img.alt ?? "",
      })) ?? [],
    variants:
      initialData?.variants?.map((v) => ({
        key: nextKey(),
        sku: v.sku,
        title: v.title,
        color: v.color ?? "",
        price: String(v.price),
        inventoryQuantity: String(v.inventoryQuantity),
        allowBackorder: v.allowBackorder,
      })) ?? [
        { key: nextKey(), sku: "", title: "", color: "", price: "0", inventoryQuantity: "0", allowBackorder: false },
      ],
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Handlers ──

  const updateField = useCallback(
    <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const updateVariant = useCallback(
    (key: string, field: keyof VariantEntry, value: string | boolean) => {
      setForm((prev) => ({
        ...prev,
        variants: prev.variants.map((v) =>
          v.key === key ? { ...v, [field]: value } : v,
        ),
      }));
    },
    [],
  );

  const addVariant = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        { key: nextKey(), sku: "", title: "", color: "", price: "0", inventoryQuantity: "0", allowBackorder: false },
      ],
    }));
  }, []);

  const removeVariant = useCallback((key: string) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((v) => v.key !== key),
    }));
  }, []);

  const addImage = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, { key: nextKey(), url: "", alt: "" }],
    }));
  }, []);

  const updateImage = useCallback(
    (key: string, field: "url" | "alt", value: string) => {
      setForm((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.key === key ? { ...img, [field]: value } : img,
        ),
      }));
    },
    [],
  );

  const removeImage = useCallback((key: string) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.key !== key),
    }));
  }, []);

  const toggleCertification = useCallback((value: string) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(value)
        ? prev.certifications.filter((c) => c !== value)
        : [...prev.certifications, value],
    }));
  }, []);

  // Auto-slug from title
  const handleTitleChange = useCallback(
    (title: string) => {
      const slug = slugify(title);
      setForm((prev) => ({
        ...prev,
        title,
        handle: isEditing ? prev.handle : slug,
      }));
    },
    [isEditing],
  );

  // ── Submit ──

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    // Client-side validation
    const clientErrors: string[] = [];
    if (!form.title.trim()) clientErrors.push("El nombre del producto es requerido");
    if (!form.handle.trim()) clientErrors.push("El handle es requerido");
    if (form.variants.length === 0) clientErrors.push("Al menos una variante es requerida");
    for (const v of form.variants) {
      if (!v.sku.trim()) clientErrors.push("Todas las variantes deben tener SKU");
      if (!v.title.trim()) clientErrors.push("Todas las variantes deben tener un talle/nombre");
    }

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      title: form.title.trim(),
      handle: form.handle.trim(),
      description: form.description.trim() || undefined,
      material: form.material.trim() || undefined,
      countryOfOrigin: form.countryOfOrigin.trim() || undefined,
      categoryId: form.categoryId || undefined,
      certifications: form.certifications,
      images: form.images.filter((img) => img.url.trim()).map((img) => ({
        url: img.url.trim(),
        alt: img.alt.trim() || undefined,
      })),
      thumbnail: form.images[0]?.url || undefined,
      variants: form.variants.map((v) => ({
        sku: v.sku.trim(),
        title: v.title.trim(),
        color: v.color.trim() || undefined,
        price: parseInt(v.price, 10) || 0,
        currency: "EUR",
        inventoryQuantity: parseInt(v.inventoryQuantity, 10) || 0,
        allowBackorder: v.allowBackorder,
      })),
    };

    const result = isEditing
      ? await updateProduct(productId, payload)
      : await createProduct(payload);

    if (result.success) {
      router.push("/admin/productos");
      router.refresh();
    } else {
      setErrors([result.error]);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Errors */}
      {errors.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <ul className="list-disc pl-4 text-sm text-red-700">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Basic info */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Información básica
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Nombre *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Camiseta de algodón orgánico"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Handle (slug) *
            </label>
            <input
              type="text"
              value={form.handle}
              onChange={(e) => updateField("handle", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="camiseta-algodon-organico"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">Sin categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Descripción del producto..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Material
            </label>
            <input
              type="text"
              value={form.material}
              onChange={(e) => updateField("material", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Algodón orgánico 100%"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              País de origen
            </label>
            <input
              type="text"
              value={form.countryOfOrigin}
              onChange={(e) => updateField("countryOfOrigin", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="España"
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Imágenes</h2>
          <button
            type="button"
            onClick={addImage}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            + Agregar imagen
          </button>
        </div>
        {form.images.length === 0 ? (
          <p className="text-sm text-gray-500">
            No hay imágenes. Agregá URLs de imágenes o de Cloudinary.
          </p>
        ) : (
          <div className="space-y-3">
            {form.images.map((img) => (
              <div key={img.key} className="flex items-start gap-3 rounded-md bg-gray-50 p-3">
                {img.url && (
                  <img
                    src={img.url}
                    alt={img.alt || ""}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23ccc' stroke-width='2'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
                    }}
                  />
                )}
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={img.url}
                    onChange={(e) => updateImage(img.key, "url", e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="https://... (URL de la imagen)"
                  />
                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) => updateImage(img.key, "alt", e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Texto alternativo (opcional)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(img.key)}
                  className="flex-shrink-0 rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Variants */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Variantes *</h2>
          <button
            type="button"
            onClick={addVariant}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            + Agregar variante
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                <th className="pb-2 pr-2 font-medium">Talle</th>
                <th className="pb-2 pr-2 font-medium">Color</th>
                <th className="pb-2 pr-2 font-medium">SKU</th>
                <th className="pb-2 pr-2 font-medium">Precio (cents)</th>
                <th className="pb-2 pr-2 font-medium">Stock</th>
                <th className="pb-2 pr-2 font-medium">Backorder</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {form.variants.map((v) => (
                <tr key={v.key} className="border-b border-gray-50">
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={v.title}
                      onChange={(e) => updateVariant(v.key, "title", e.target.value)}
                      className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="92"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => updateVariant(v.key, "color", e.target.value)}
                      className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="Rojo"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => updateVariant(v.key, "sku", e.target.value)}
                      className="w-28 rounded-md border border-gray-300 px-2 py-1.5 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      placeholder="CAM-ORG-092"
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => updateVariant(v.key, "price", e.target.value)}
                      className="w-24 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      min={0}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="number"
                      value={v.inventoryQuantity}
                      onChange={(e) => updateVariant(v.key, "inventoryQuantity", e.target.value)}
                      className="w-20 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      min={0}
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <input
                      type="checkbox"
                      checked={v.allowBackorder}
                      onChange={(e) => updateVariant(v.key, "allowBackorder", e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                  </td>
                  <td className="py-2">
                    <button
                      type="button"
                      onClick={() => removeVariant(v.key)}
                      className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      disabled={form.variants.length <= 1}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Certifications */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Certificaciones
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {CERTIFICATIONS.map((cert) => (
            <label
              key={cert.value}
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 text-sm hover:bg-gray-50 has-checked:border-primary-300 has-checked:bg-primary-50"
            >
              <input
                type="checkbox"
                checked={form.certifications.includes(cert.value)}
                onChange={() => toggleCertification(cert.value)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-gray-700">{cert.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Guardando..."
            : isEditing
            ? "Guardar cambios"
            : "Crear producto"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/productos")}
          className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
