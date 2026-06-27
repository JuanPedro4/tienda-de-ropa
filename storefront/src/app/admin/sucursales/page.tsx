import { getStores } from "@/lib/admin/stores-actions";
import { StoresClient } from "./stores-client";

export default async function AdminSucursalesPage() {
  const stores = await getStores();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Sucursales</h1>
      <StoresClient stores={stores} />
    </div>
  );
}
