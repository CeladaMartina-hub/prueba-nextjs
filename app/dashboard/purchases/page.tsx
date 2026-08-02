import { fetchPurchases } from '@/app/lib/data';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default async function Page() {
  const purchases = await fetchPurchases();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Compras / Gastos</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Link
          href="/dashboard/purchases/create"
          className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
        >
          <span>Registrar compra</span>
          <PlusIcon className="h-5" />
        </Link>
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-2">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Descripción</th>
              <th className="px-4 py-3">Cantidad</th>
              <th className="px-4 py-3">Costo total</th>
              <th className="px-4 py-3">Costo por unidad</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {purchases.map((p) => (
              <tr key={p.id} className="border-b last:border-none">
                <td className="px-4 py-3">{new Date(p.purchase_date).toLocaleDateString('es-AR')}</td>
                <td className="px-4 py-3">{p.description}</td>
                <td className="px-4 py-3">{p.quantity} {p.unit}</td>
                <td className="px-4 py-3">${p.total_cost.toLocaleString('es-AR')}</td>
                <td className="px-4 py-3">
                  ${(p.total_cost / p.quantity).toLocaleString('es-AR', { maximumFractionDigits: 2 })} / {p.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}