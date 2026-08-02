import { fetchKits } from '@/app/lib/data';
import Link from 'next/link';
import Image from 'next/image';
import { PlusIcon } from '@heroicons/react/24/outline';

export default async function Page() {
  const kits = await fetchKits();

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">Kits</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Link
          href="/dashboard/kits/create"
          className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500"
        >
          <span>Armar kit</span>
          <PlusIcon className="h-5" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {kits.map((kit) => {
          const profit = kit.price - kit.cost;
          return (
           <Link key={kit.id} href={`/dashboard/kits/${kit.id}`} className="overflow-hidden rounded-xl border hover:shadow-md">
              <div className="relative aspect-square bg-gray-100">
                <Image src={kit.image_url} alt={kit.name} fill className="object-cover" />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium">{kit.name}</p>
                <p className="mt-1 text-sm font-semibold text-blue-600">
                  ${kit.price.toLocaleString('es-AR')}
                </p>
                <p className="text-xs text-gray-500">
                  Costo: ${kit.cost.toLocaleString('es-AR')} · Ganancia: ${profit.toLocaleString('es-AR')}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {kits.length === 0 && (
        <p className="mt-8 text-center text-gray-500">Todavía no armaste ningún kit.</p>
      )}
    </div>
  );
}