import { fetchSales } from '@/app/lib/data';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';
import SalesTable from '@/app/ui/sales/table';

export default async function Page() {
  const sales = await fetchSales();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Ventas</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Link
          href="/dashboard/sales/create"
          className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
        >
          <span>Nueva venta</span>
          <PlusIcon className="h-5" />
        </Link>
      </div>
      <SalesTable sales={sales} />
    </div>
  );
}