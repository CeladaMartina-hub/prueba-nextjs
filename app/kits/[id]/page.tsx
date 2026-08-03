import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchKitById } from "@/app/lib/data";
import Link from "next/dist/client/link";

export default async function KitDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const kit = await fetchKitById(id);

  if (!kit || kit.items.length === 0) {
    notFound();
  }

  const whatsappNumber = "5491137801717";
  const message = `Hola, me interesa el kit "${kit.name}"`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="mx-auto max-w-screen-lg px-4 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
          <Image
            src={kit.image_url}
            alt={kit.name}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <span className="inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
            Kit
          </span>

          <h1 className="mt-2 text-2xl font-semibold">{kit.name}</h1>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            ${kit.price.toLocaleString("es-AR")}
          </p>

          {kit.description && (
            <div className="mt-6 border-t pt-4">
              <p className="mb-1 text-sm font-medium text-gray-600">
                Descripción
              </p>
              <p className="text-sm leading-relaxed">{kit.description}</p>
            </div>
          )}

          <div className="mt-6 border-t pt-4">
            <p className="mb-2 text-sm font-medium text-gray-600">
              Este kit incluye
            </p>
            <ul className="space-y-1 text-sm">
              {kit.items.map((item, i) => (
                <li key={i} className="flex justify-between">
                  <span>{item.product_name}</span>
                  <span className="text-gray-500">
                    {item.quantity} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>         

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 font-medium text-[#0B3B18] hover:opacity-90"
          >
            Consultar por WhatsApp
          </a>

          <div className="mt-6">
            <Link
              href="/kits"
              className="text-sm text-blue-600 hover:underline"
            >
              ← Volver a Combos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
