interface StockBadgeProps {
  inventoryQuantity: number;
  allowBackorder?: boolean;
}

export default function StockBadge({
  inventoryQuantity,
  allowBackorder = false,
}: StockBadgeProps) {
  if (inventoryQuantity === 0 && !allowBackorder) {
    return (
      <span className="inline-flex items-center gap-1 border border-brand-200 px-2 py-1 text-[10px] uppercase tracking-wider text-brand-500">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
        Agotado
      </span>
    );
  }

  if (inventoryQuantity <= 3 && inventoryQuantity > 0) {
    return (
      <span className="inline-flex items-center gap-1 border border-brand-200 px-2 py-1 text-[10px] uppercase tracking-wider text-brand-500">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
        Quedan {inventoryQuantity} unidad{inventoryQuantity !== 1 ? "es" : ""}
      </span>
    );
  }

  if (allowBackorder) {
    return (
      <span className="inline-flex items-center gap-1 border border-brand-200 px-2 py-1 text-[10px] uppercase tracking-wider text-brand-500">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
        Disponible bajo pedido
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 border border-brand-200 px-2 py-1 text-[10px] uppercase tracking-wider text-brand-500">
      <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
      En stock
    </span>
  );
}
