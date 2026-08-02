import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchKitById } from '@/app/lib/data';
import { deleteKit } from '@/app/lib/actions';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const kit = await fetchKitById(id);

  if (!kit) {
    notFound();
  }

  const profit = kit.price - kit.cost;

  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        <h1 className="text-2xl">{kit.name}</h1>
        <div className="flex gap-2">
          <Link
            href={`/dashboard/kits/${kit.id}/edit`}
            className="rounded-md border p-2 hover:bg-gray-100"
          >
            <PencilIcon className="w-5" />
          </Link>
          <form action={deleteKit.bind(null, kit.id)}>
            <button className="rounded-md border p-2 hover:bg-gray-100">
              <TrashIcon className="w-5" />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          <Image src={kit.image_url} alt={kit.name} fill className="object-cover" />
        </div>

        <div>
          {kit.description && <p className="text-sm text-gray-600">{kit.description}</p>}

          <div className="mt-4 rounded-md bg-gray-50 p-4">
            <p className="text-sm">
              Precio: <span className="font-semibold">${kit.price.toLocaleString('es-AR')}</span>
            </p>
            <p className="text-sm">
              Costo: <span className="font-semibold">${kit.cost.toLocaleString('es-AR')}</span>
            </p>
            <p className="text-sm">
              Ganancia:{' '}
              <span className={`font-semibold ${profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${profit.toLocaleString('es-AR')}
              </span>
            </p>
          </div>

          <p className="mt-4 mb-2 text-sm font-medium text-gray-600">Este kit incluye:</p>
          <table className="min-w-full text-sm">
            <tbody>
              {kit.items.map((item, i) => (
                <tr key={i} className="border-b last:border-none">
                  <td className="py-2">{item.product_name}</td>
                  <td className="py-2 text-right">{item.quantity} {item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/dashboard/kits" className="text-sm text-blue-600 hover:underline">
          ← Volver a kits
        </Link>
      </div>
    </div>
  );
}