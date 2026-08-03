import Link from "next/link";
import Image from "next/image";
import { fetchAllProducts, fetchProductByCategoryId } from "@/app/lib/data";
import { formatPrice } from "@/app/lib/utils";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  const products = category
    ? await fetchProductByCategoryId(category)
    : await fetchAllProducts();

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Productos</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="overflow-hidden rounded-xl border hover:shadow-md"
          >
            <div className="relative aspect-square bg-gray-100">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium">{product.name}</p>
              <p className="mt-1 text-sm font-semibold text-blue-600">
                {formatPrice(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {products.length === 0 && (
        <p className="mt-8 text-center text-gray-500">
          Todavía no hay productos cargados.
        </p>
      )}
    </div>
  );
}
