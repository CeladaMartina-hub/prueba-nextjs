import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchProductById } from "@/app/lib/data";
import { formatCurrency } from "@/app/lib/utils";

export default async function ProductDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  const whatsappNumber = "5491137801717";
  const message = `Hola, me interesa el producto "${product.name}"`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="mx-auto max-w-screen-md px-4 py-8">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <span className="mt-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
        {product.category_name}
      </span>

      <h1 className="mt-2 text-xl font-semibold">{product.name}</h1>
      <p className="mt-1 text-2xl font-semibold text-blue-600">
        {formatCurrency(product.price)}
      </p>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 font-medium text-[#0B3B18] hover:opacity-90"
      >
        Consultar por WhatsApp
      </a>

      {product.description && (
        <div className="mt-6 border-t pt-4">
          <p className="mb-1 text-sm font-medium text-gray-600">Descripción</p>
          <p className="text-sm leading-relaxed">{product.description}</p>
        </div>
      )}
    </div>
  );
}
