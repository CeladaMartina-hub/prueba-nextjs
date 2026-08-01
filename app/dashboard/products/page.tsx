import { fetchProducts } from '@/app/lib/data';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import ProductsTable from '@/app/ui/products/table';


export default async function Page() {
  const products = await fetchProducts();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Productos</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Link
          href="/dashboard/products/create"
          className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
        >
          <span>Crear producto</span>
          <PlusIcon className="h-5" />
        </Link>
      </div>
      <ProductsTable products={products} />
    </div>
  );
}