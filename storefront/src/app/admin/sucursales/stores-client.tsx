"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  createStore,
  updateStore,
  deleteStore,
} from "@/lib/admin/stores-actions";
import type { Store, StoreHours } from "@prisma/client";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface StoreWithHours extends Store {
  storeHours: StoreHours[];
}

interface StoreFormData {
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  lat: string;
  lng: string;
  isActive: boolean;
}

// ──────────────────────────────────────────────
// StoresClient
// ──────────────────────────────────────────────

interface StoresClientProps {
  stores: StoreWithHours[];
}

export function StoresClient({ stores }: StoresClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StoreFormData>({
    name: "",
    slug: "",
    address: "",
    city: "",
    phone: "",
    lat: "",
    lng: "",
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openNew = useCallback(() => {
    setEditingId(null);
    setForm({
      name: "",
      slug: "",
      address: "",
      city: "",
      phone: "",
      lat: "",
      lng: "",
      isActive: true,
    });
    setError(null);
    setIsModalOpen(true);
  }, []);

  const openEdit = useCallback((store: StoreWithHours) => {
    setEditingId(store.id);
    setForm({
      name: store.name,
      slug: store.slug,
      address: store.address,
      city: store.city,
      phone: store.phone ?? "",
      lat: String(store.lat),
      lng: String(store.lng),
      isActive: store.isActive,
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

      const lat = parseFloat(form.lat);
      const lng = parseFloat(form.lng);

      if (isNaN(lat) || isNaN(lng)) {
        setError("Las coordenadas deben ser números válidos");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        phone: form.phone.trim() || undefined,
        lat,
        lng,
        hours: {},
        isActive: form.isActive,
      };

      const result = editingId
        ? await updateStore(editingId, payload)
        : await createStore(payload);

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
      if (!window.confirm("¿Estás seguro de eliminar esta sucursal?")) return;
      const result = await deleteStore(id);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    },
    [router],
  );

  const handleNameChange = useCallback(
    (name: string) => {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setForm((prev) => ({ ...prev, name, slug: editingId ? prev.slug : slug }));
    },
    [editingId],
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openNew}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          + Nueva sucursal
        </button>
      </div>

      {/* Stores table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">Dirección</th>
              <th className="px-4 py-3 font-medium">Ciudad</th>
              <th className="px-4 py-3 font-medium">Teléfono</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Coordenadas</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-500">
                  No hay sucursales. Creá la primera.
                </td>
              </tr>
            ) : (
              stores.map((store) => (
                <tr
                  key={store.id}
                  className="border-b border-gray-50 transition hover:bg-gray-50"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {store.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{store.address}</td>
                  <td className="px-4 py-3 text-gray-600">{store.city}</td>
                  <td className="px-4 py-3 text-gray-500">{store.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        store.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {store.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {store.lat.toFixed(4)}, {store.lng.toFixed(4)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(store)}
                        className="text-sm text-primary-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(store.id)}
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
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {editingId ? "Editar sucursal" : "Nueva sucursal"}
            </h2>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
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
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Activa
                  </label>
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            isActive: e.target.checked,
                          }))
                        }
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">
                        Sucursal activa
                      </span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Latitud *
                  </label>
                  <input
                    type="text"
                    value={form.lat}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, lat: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="-34.6037"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Longitud *
                  </label>
                  <input
                    type="text"
                    value={form.lng}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, lng: e.target.value }))
                    }
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="-58.3816"
                    required
                  />
                </div>
              </div>

              {/* Map preview */}
              {form.lat && form.lng && !isNaN(parseFloat(form.lat)) && !isNaN(parseFloat(form.lng)) && (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${form.lat},${form.lng}&zoom=14&size=500x200&markers=color:red%7C${form.lat},${form.lng}&key=YOUR_API_KEY`}
                    alt="Mapa preview"
                    className="w-full"
                    onError={(e) => {
                      // Fallback: show OSM if GMaps fails
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="bg-gray-50 px-3 py-2 text-xs text-gray-500">
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${form.lat}&mlon=${form.lng}&zoom=14`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline"
                    >
                      Ver en OpenStreetMap ↗
                    </a>
                  </div>
                </div>
              )}

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
                    : "Crear sucursal"}
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
