import { getDashboardData } from "@/lib/admin/dashboard-actions";
import { StatusBadge } from "../status-badge";

// ──────────────────────────────────────────────
// Dashboard Page
// ──────────────────────────────────────────────

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          title="Ventas hoy"
          value={formatCurrency(data.salesToday)}
          color="green"
        />
        <StatCard
          title="Ventas esta semana"
          value={formatCurrency(data.salesWeek)}
          color="green"
        />
        <StatCard
          title="Ventas este mes"
          value={formatCurrency(data.salesMonth)}
          color="green"
        />
        <StatCard
          title="Pedidos pendientes"
          value={String(data.pendingOrders)}
          color="yellow"
        />
        <StatCard
          title="Productos agotados"
          value={String(data.outOfStock)}
          color="red"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent orders */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Últimos pedidos
          </h2>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No hay pedidos recientes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Cliente</th>
                    <th className="pb-2 pr-4 font-medium">Total</th>
                    <th className="pb-2 pr-4 font-medium">Estado</th>
                    <th className="pb-2 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-900">{order.customerName}</td>
                      <td className="py-2 pr-4 font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-2 pr-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Low stock products */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Productos con stock bajo ({data.lowStock})
          </h2>
          {data.lowStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500">
              No hay productos con stock bajo.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Producto</th>
                    <th className="pb-2 pr-4 font-medium">SKU</th>
                    <th className="pb-2 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockProducts.map((product) => (
                    <tr key={product.sku} className="border-b border-gray-50">
                      <td className="py-2 pr-4 text-gray-900">{product.title}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-gray-500">
                        {product.sku}
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            product.stock === 0
                              ? "bg-red-100 text-red-700"
                              : product.stock < 3
                              ? "bg-orange-100 text-orange-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {product.stock} uds.
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// StatCard
// ──────────────────────────────────────────────

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: "green" | "yellow" | "red";
}) {
  const colors = {
    green: "from-green-50 to-green-100 border-green-200 text-green-700",
    yellow: "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-700",
    red: "from-red-50 to-red-100 border-red-200 text-red-700",
  };

  return (
    <div
      className={`rounded-xl border bg-gradient-to-br p-5 shadow-sm ${colors[color]}`}
    >
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
