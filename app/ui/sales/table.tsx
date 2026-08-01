import Link from 'next/link';
import { EyeIcon } from '@heroicons/react/24/outline';

type SaleRow = {
  id: string;
  customer_full_name: string | null;
  sale_date: string;
  total: number;
};

export default function SalesTable({ sales }: { sales: SaleRow[] }) {
  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <table className="min-w-full text-gray-900">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Fecha</th>
                <th scope="col" className="px-3 py-5 font-medium">Cliente</th>
                <th scope="col" className="px-3 py-5 font-medium">Total</th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Ver</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {sales.map((sale) => (
                <tr
                  key={sale.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    {new Date(sale.sale_date).toLocaleDateString('es-AR')}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {sale.customer_full_name || 'Mostrador'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    ${sale.total.toLocaleString('es-AR')}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end">
                      <Link
                        href={`/dashboard/sales/${sale.id}`}
                        className="rounded-md border p-2 hover:bg-gray-100"
                      >
                        <EyeIcon className="w-5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}