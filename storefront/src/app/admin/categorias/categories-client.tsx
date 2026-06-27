"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/admin/categories-actions";
import type { Category } from "@prisma/client";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface CategoryWithRelations extends Category {
  parent: { id: string; name: string } | null;
  _count: { products: number };
  children: { id: string; name: string }[];
}

interface CategoryFormData {
  name: string;
  handle: string;
  description: string;
  parentId: string;
  order: number;
}

// ──────────────────────────────────────────────
// CategoriesClient
// ──────────────────────────────────────────────

interface CategoriesClientProps {
  categories: CategoryWithRelations[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormData>({
    name: "",
    handle: "",
    description: "",
    parentId: "",
    order: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Flat list for parent dropdown (exclude self & children when editing)
  const getParentOptions = useCallback(() => {
    if (!editingId) return categories;
    const excludeIds = new Set<string>();
    excludeIds.add(editingId);
    // Also exclude children
    const cat = categories.find((c) => c.id === editingId);
    if (cat) {
      for (const child of cat.children) {
        excludeIds.add(child.id);
      }
    }
    return categories.filter((c) => !excludeIds.has(c.id));
  }, [categories, editingId]);

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm({ name: "", handle: "", description: "", parentId: "", order: 0 });
    setError(null);
    setIsModalOpen(true);
  }, []);

  const openEdit = useCallback((cat: CategoryWithRelations) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      handle: cat.handle,
      description: cat.description ?? "",
      parentId: cat.parentId ?? "",
      order: cat.order,
    });
    setError(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingId(null);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);

      const payload = {
        name: form.name.trim(),
        handle: form.handle.trim(),
        description: form.description.trim() || undefined,
        parentId: form.parentId || null,
        order: form.order,
      };

      const result = editingId
        ? await updateCategory(editingId, payload)
        : await createCategory(payload);

      if (result.success) {
        closeModal();
        router.refresh();
      } else {
        setError(result.error);
      }
      setIsSubmitting(false);
    },
    [form, editingId, closeModal, router],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm("¿Estás seguro de eliminar esta categoría?")) return;
      const result = await deleteCategory(id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    },
    [router],
  );

  // Auto-slug
  const handleNameChange = useCallback(
    (name: string) => {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setForm((prev) => ({ ...prev, name, handle: editingId ? prev.handle : slug }));
    },
    [editingId],
  );

  return (
    <div>
      {/* Header + New button */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openNew}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          + Nueva categoría
        </button>
      </div>

      {/* Categories table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Handle</th>
              <th className="px-4 py-3 font-medium">Categoría padre</th>
              <th className="px-4 py-3 font-medium">Orden</th>
              <th className="px-4 py-3 font-medium">Productos</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">
                  No hay categorías. Creá la primera.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-gray-50 transition hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {cat.name}
                    {cat.children.length > 0 && (
                      <span className="ml-2 text-xs text-gray-400">
                        ({cat.children.length} sub)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {cat.handle}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {cat.parent?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{cat.order}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {cat._count.products}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {editingId ? "Editar categoría" : "Nueva categoría"}
            </h2>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Handle *
                </label>
                <input
                  type="text"
                  value={form.handle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, handle: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={2}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría padre
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, parentId: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Sin categoría padre</option>
                  {getParentOptions().map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Orden
                </label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="mt-1 block w-24 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min={0}
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Guardando..."
                    : editingId
                    ? "Guardar cambios"
                    : "Crear categoría"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
