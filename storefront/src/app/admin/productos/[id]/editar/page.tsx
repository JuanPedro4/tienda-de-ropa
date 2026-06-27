import { notFound } from "next/navigation";
import { getProduct } from "@/lib/admin/products-actions";
import { getCategories } from "@/lib/admin/categories-actions";
import { ProductForm } from "../../product-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProduct(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Editar: {product.title}
      </h1>
      <ProductForm
        productId={product.id}
        categories={categories}
        initialData={{
          title: product.title,
          handle: product.handle,
          description: product.description,
          material: product.material,
          countryOfOrigin: product.countryOfOrigin,
          categoryId: product.categoryId ?? null,
          certifications: product.certifications,
          thumbnail: product.thumbnail,
          images: product.images,
          variants: product.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            title: v.title,
            color: v.color,
            price: v.price,
            currency: v.currency,
            inventoryQuantity: v.inventoryQuantity,
            allowBackorder: v.allowBackorder,
          })),
        }}
      />
    </div>
  );
}
