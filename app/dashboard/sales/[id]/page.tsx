import { fetchSaleById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const sale = await fetchSaleById(id);

  if (!sale) {
    notFound();
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl">Detalle de venta</h1>

      <div className="mt-4 rounded-md bg-gray-50 p-4 md:p-6">
        <p className="text-sm text-gray-600">
          Fecha: {new Date(sale.sale_date).toLocaleDateString('es-AR')}
        </p>
        <p className="text-sm text-gray-600">
          Cliente: {sale.customer_full_name || 'Mostrador'}
        </p>

        <table className="mt-4 min-w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="px-3 py-2">Producto</th>
              <th className="px-3 py-2">Cantidad</th>
              <th className="px-3 py-2">Precio unit.</th>
              <th className="px-3 py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => (
              <tr key={i} className="border-b last:border-none">
                <td className="px-3 py-2">{item.item_name}</td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2">${item.unit_price.toLocaleString('es-AR')}</td>
                <td className="px-3 py-2">
                  ${(item.quantity * item.unit_price).toLocaleString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-4 text-right text-lg font-semibold">
          Total: ${sale.total.toLocaleString('es-AR')}
        </p>
      </div>

      <div className="mt-6">
        <Link href="/dashboard/sales" className="text-sm text-blue-600 hover:underline">
          ← Volver a ventas
        </Link>
      </div>
    </div>
  );
}