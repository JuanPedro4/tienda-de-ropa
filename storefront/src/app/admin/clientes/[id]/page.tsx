import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerDetail } from "@/lib/admin/customers-actions";
import { StatusBadge } from "../../status-badge";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/clientes"
          className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a clientes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {customer.name ?? "Cliente"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">{customer.email}</p>
      </div>

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Pedidos totales</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {customer.totalOrders}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Gasto total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {formatCurrency(customer.totalSpent)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Cliente desde</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {formatDate(customer.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Order history */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Historial de pedidos
          </h2>
          {customer.orders.length === 0 ? (
            <p className="text-sm text-gray-500">No ha realizado pedidos.</p>
          ) : (
            <div className="space-y-3">
              {customer.orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/pedidos/${order.id}`}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3 transition hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.storeName ?? "Sin sucursal"} —{" "}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Wishlist */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Wishlist ({customer.wishlist.length})
          </h2>
          {customer.wishlist.length === 0 ? (
            <p className="text-sm text-gray-500">
              No ha guardado productos en wishlist.
            </p>
          ) : (
            <div className="space-y-2">
              {customer.wishlist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <p className="text-sm text-gray-900">
                    {item.productTitle ?? item.productId}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Reseñas escritas ({customer.reviews.length})
          </h2>
          {customer.reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No ha escrito reseñas.</p>
          ) : (
            <div className="space-y-3">
              {customer.reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-lg border border-gray-100 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {review.productTitle ?? review.productId}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-yellow-500">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="mb-2 text-sm text-gray-600">
                      {review.comment}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <StatusBadge status={review.status} />
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
