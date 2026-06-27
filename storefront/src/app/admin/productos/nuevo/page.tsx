import { getCategories } from "@/lib/admin/categories-actions";
import { ProductForm } from "../product-form";

export default async function NuevoProductoPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
