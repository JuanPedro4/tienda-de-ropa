"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  updateOrderStatus,
  markReady,
  markPickedUp,
  cancelOrder,
} from "@/lib/admin/orders-actions";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  pickupCode: string | null;
}

const STATUS_ACTIONS: Record<
  string,
  Array<{
    nextStatus: string;
    label: string;
    variant: "primary" | "danger" | "success" | "outline";
    needsCode?: boolean;
  }>
> = {
  PENDING: [
    { nextStatus: "CONFIRMED", label: "Confirmar pedido", variant: "primary" },
    { nextStatus: "CANCELLED", label: "Cancelar pedido", variant: "danger" },
  ],
  CONFIRMED: [
    { nextStatus: "PREPARING", label: "Marcar en preparación", variant: "primary" },
    { nextStatus: "CANCELLED", label: "Cancelar pedido", variant: "danger" },
  ],
  PREPARING: [
    { nextStatus: "READY", label: "Marcar como listo", variant: "success" },
    { nextStatus: "CANCELLED", label: "Cancelar pedido", variant: "danger" },
  ],
  READY: [
    { nextStatus: "PICKED_UP", label: "Marcar como retirado", variant: "success", needsCode: true },
  ],
  PICKED_UP: [],
  CANCELLED: [],
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const actions = STATUS_ACTIONS[currentStatus] ?? [];

  const handleAction = useCallback(
    async (nextStatus: string) => {
      setIsPending(true);
      setError(null);

      let result;

      if (nextStatus === "READY") {
        result = await markReady(orderId);
      } else if (nextStatus === "PICKED_UP") {
        if (!code) {
          setError("Ingresá el código de retiro");
          setIsPending(false);
          return;
        }
        result = await markPickedUp(orderId, code);
      } else if (nextStatus === "CANCELLED") {
        if (!window.confirm("¿Estás seguro de cancelar este pedido?")) {
          setIsPending(false);
          return;
        }
        result = await cancelOrder(orderId);
      } else {
        result = await updateOrderStatus(
          orderId,
          nextStatus as "CONFIRMED" | "PREPARING",
        );
      }

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? "Error desconocido");
      }
      setIsPending(false);
    },
    [orderId, code, router],
  );

  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Acciones</h2>

      {error && (
        <div className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {actions.map((action) => (
          <div key={action.nextStatus}>
            {action.needsCode && showCodeInput ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono tracking-widest focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Código de retiro"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleAction(action.nextStatus)}
                    disabled={isPending || !code}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      action.variant === "success"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-primary-600 hover:bg-primary-700"
                    }`}
                  >
                    {isPending ? "Procesando..." : "Verificar y retirar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeInput(false);
                      setCode("");
                    }}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : action.needsCode ? (
              <button
                type="button"
                onClick={() => setShowCodeInput(true)}
                disabled={isPending}
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  action.variant === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-primary-600 hover:bg-primary-700"
                }`}
              >
                {action.label}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAction(action.nextStatus)}
                disabled={isPending}
                className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  action.variant === "danger"
                    ? "border border-red-300 text-red-600 hover:bg-red-50"
                    : action.variant === "success"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-primary-600 text-white hover:bg-primary-700"
                }`}
              >
                {isPending ? "Procesando..." : action.label}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
