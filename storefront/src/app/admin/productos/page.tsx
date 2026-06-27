import Link from "next/link";
import { getProducts } from "@/lib/admin/products-actions";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default async function AdminProductosPage() {
  const products = await getProducts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link
          href="/admin/productos/nuevo"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
        >
          + Nuevo producto
        </Link>
      </div>

      {/* Products table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <th className="px-4 py-3 font-medium">Imagen</th>
              <th className="px-4 py-3 font-medium">Nombre</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Precio</th>
              <th className="px-4 py-3 font-medium">Stock total</th>
              <th className="px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-sm text-gray-500"
                >
                  No hay productos todavía.{ " " }
                  <Link
                    href="/admin/productos/nuevo"
                    className="text-primary-600 hover:underline"
                  >
                    Crear el primero
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const totalStock = product.variants.reduce(
                  (sum, v) => sum + v.inventoryQuantity,
                  0,
                );
                const minPrice = Math.min(
                  ...product.variants.map((v) => v.price),
                );
                const productImages = (product.images ?? []) as Array<{ url: string; alt?: string }>;
                const firstImage = productImages.length > 0 ? productImages[0]?.url : null;

                return (
                  <tr
                    key={product.id}
                    className="border-b border-gray-50 transition hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt=""
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400">
                          —
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link
                        href={`/admin/productos/${product.id}/editar`}
                        className="hover:text-primary-600"
                      >
                        {product.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {product.variants[0]?.sku ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {product.category?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {formatCurrency(minPrice)}
                      {product.variants.length > 1 && "+"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          totalStock === 0
                            ? "bg-red-100 text-red-700"
                            : totalStock < 10
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {totalStock} uds.
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/productos/${product.id}/editar`}
                        className="text-sm text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
