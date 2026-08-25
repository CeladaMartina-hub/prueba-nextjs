import Pagination from '@/app/ui/pagination';
import Search from '@/app/ui/search';
import ProductsTable from '@/app/ui/products/table';
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { fetchProductsPages } from '@/app/lib/data';

export default async function Page(props: {
  searchParams?: Promise<{ query?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchProductsPages(query);

  const exportUrl = `/api/products/export${query ? `?query=${encodeURIComponent(query)}` : ''}`;

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Productos</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Buscar productos..." />
        
        <div className="flex items-center gap-2">
          <a
            href={exportUrl}
            download="productos.csv"
            className="flex h-10 items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5" />
            <span className="hidden md:inline">Exportar Excel</span>
          </a>

          <Link
            href="/dashboard/products/create"
            className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
          >
            <span>Crear producto</span>
            <PlusIcon className="h-5" />
          </Link>
        </div>
      </div>
      <ProductsTable query={query} currentPage={currentPage} />
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}