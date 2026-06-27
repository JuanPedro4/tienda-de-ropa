import { getCategories } from "@/lib/admin/categories-actions";
import { CategoriesClient } from "./categories-client";

export default async function AdminCategoriasPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Categorías</h1>
      <CategoriesClient categories={categories} />
    </div>
  );
}
