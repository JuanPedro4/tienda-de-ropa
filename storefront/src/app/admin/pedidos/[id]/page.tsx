import { notFound } from "next/navigation";
import { getOrderDetail } from "@/lib/admin/orders-actions";
import { StatusBadge } from "../../status-badge";
import { OrderActions } from "./order-actions";

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
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PREPARING: "Preparando",
  READY: "Listo para retirar",
  PICKED_UP: "Retirado",
  CANCELLED: "Cancelado",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderDetail(id);

  if (!order) {
    notFound();
  }

  const items = (order.items as Array<{
    name?: string;
    title?: string;
    variantTitle?: string;
    size?: string;
    color?: string;
    quantity: number;
    price: number;
  }>) ?? [];

  const daysOfWeek = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const storeHours = order.store?.hours as Record<string, { open: string; close: string; isClosed?: boolean }> | null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{order.id.slice(0, 8)}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Creado el {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column: order info + items */}
        <div className="space-y-6 lg:col-span-2">
          {/* Customer info */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">
              Cliente
            </h2>
            <div className="space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-medium">Nombre:</span>{" "}
                {order.customerName}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {order.customerEmail}
              </p>
              {order.customerId && (
                <p className="mt-2">
                  <a
                    href={`/admin/clientes/${order.customerId}`}
                    className="text-primary-600 hover:underline"
                  >
                    Ver perfil del cliente →
                  </a>
                </p>
              )}
            </div>
          </section>

          {/* Items */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Items del pedido
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Producto</th>
                    <th className="pb-2 pr-4 font-medium">Talle</th>
                    <th className="pb-2 pr-4 font-medium">Color</th>
                    <th className="pb-2 pr-4 font-medium">Cant.</th>
                    <th className="pb-2 font-medium">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-900">
                        {item.title ?? item.name ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">
                        {item.size ?? item.variantTitle ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-gray-600">
                        {item.color ?? "—"}
                      </td>
                      <td className="py-2 pr-4 text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="py-2 font-medium text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="py-2 pr-4 text-right text-sm font-medium text-gray-700">
                      Total
                    </td>
                    <td className="py-2 text-base font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Notes */}
          {order.notes && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                Notas
              </h2>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </section>
          )}
        </div>

        {/* Right column: store + timeline + actions */}
        <div className="space-y-6">
          {/* Store info */}
          {order.store && (
            <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Sucursal de retiro
              </h2>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-medium text-gray-900">{order.store.name}</p>
                <p>{order.store.address}</p>
                <p>{order.store.city}</p>
                {order.store.phone && <p>Tel: {order.store.phone}</p>}
              </div>
              {storeHours && (
                <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
                  {daysOfWeek.map((day, idx) => {
                    const dayNum = idx; // 0 = Sunday
                    const hours = storeHours[String(dayNum)];
                    if (!hours) return null;
                    return (
                      <p key={dayNum}>
                        <span className="font-medium text-gray-600">{day}:</span>{" "}
                        {hours.isClosed
                          ? "Cerrado"
                          : `${hours.open} - ${hours.close}`}
                      </p>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Timeline */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Timeline
            </h2>
            <div className="space-y-4">
              {/* Initial creation */}
              <TimelineItem
                status="Creado"
                date={formatDate(order.createdAt)}
                isFirst
              />

              {/* Status history */}
              {order.statusHistory.map((entry, idx) => (
                <TimelineItem
                  key={idx}
                  status={STATUS_LABELS[entry.status] ?? entry.status}
                  date={new Date(entry.timestamp).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                />
              ))}

              {/* Current status if not in history */}
              {!order.statusHistory.some((h) => h.status === order.status) && order.status !== "PENDING" && (
                <TimelineItem
                  status={STATUS_LABELS[order.status] ?? order.status}
                  date="Actual"
                  isActive
                />
              )}
            </div>
          </section>

          {/* Pickup code */}
          {order.status === "READY" && order.pickupCode && (
            <section className="rounded-xl border-2 border-green-200 bg-green-50 p-6 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-green-800">
                Código de retiro
              </h2>
              <p className="text-3xl font-bold tracking-widest text-green-700">
                {order.pickupCode}
              </p>
              <p className="mt-1 text-xs text-green-600">
                Entregá este código al cliente para verificar el retiro.
              </p>
            </section>
          )}

          {/* Actions */}
          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            pickupCode={order.pickupCode}
          />
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// TimelineItem
// ──────────────────────────────────────────────

function TimelineItem({
  status,
  date,
  isFirst,
  isActive,
}: {
  status: string;
  date: string;
  isFirst?: boolean;
  isActive?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
            isActive
              ? "border-primary-500 bg-primary-500"
              : isFirst
              ? "border-gray-400 bg-gray-400"
              : "border-gray-300 bg-white"
          }`}
        >
          {isActive && (
            <svg className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <div className="mt-0.5 h-full w-px bg-gray-200 last:hidden" />
      </div>
      <div className="pb-4">
        <p className="text-sm font-medium text-gray-900">{status}</p>
        <p className="text-xs text-gray-500">{date}</p>
      </div>
    </div>
  );
}
