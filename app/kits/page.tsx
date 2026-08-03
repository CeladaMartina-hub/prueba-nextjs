import Link from 'next/link';
import Image from 'next/image';
import { fetchPublicKits } from '@/app/lib/data';

export default async function KitsPage() {
  const kits = await fetchPublicKits();

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Combos</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {kits.map((kit) => (
          <Link
            key={kit.id}
            href={`/kits/${kit.id}`}
            className="overflow-hidden rounded-xl border hover:shadow-md"
          >
            <div className="relative aspect-square bg-gray-100">
              <Image src={kit.image_url} alt={kit.name} fill className="object-cover" />
            </div>
            <div className="p-3">
              <p className="text-sm font-medium">{kit.name}</p>
              <p className="mt-1 text-sm font-semibold text-blue-600">
                ${kit.price.toLocaleString('es-AR')}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6">
        <Link href="/products" className="text-sm text-blue-600 hover:underline">
          ← Volver a Productos
        </Link>
      </div>

      {kits.length === 0 && (
        <p className="mt-8 text-center text-gray-500">Todavía no hay kits disponibles.</p>
      )}
    </div>
  );
}