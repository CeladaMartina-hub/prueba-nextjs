import Link from "next/link";
import Image from "next/image";
import { fetchCategoriesWithImage, fetchPublicKits } from "@/app/lib/data";

export default async function HomePage() {
  const categories = await fetchCategoriesWithImage();
  const kits = await fetchPublicKits();

  return (
    <div>
      {/* Hero */}
      <section className="relative flex h-[380px] items-center justify-center bg-gradient-to-br from-green-700 to-green-500 px-4 text-center text-white">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide opacity-90">
            Nuestras ofertas
          </p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
            Productos dietéticos y bebidas saludables
          </h1>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-medium text-green-700 hover:bg-gray-100"
          >
            Ver catálogo
          </Link>
        </div>
      </section>

      {/* Texto institucional */}
      <section className="mx-auto max-w-screen-md px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold">Quiénes somos</h2>
        <p className="mt-4 text-gray-600">
          Somos una tienda dedicada a ofrecer productos dietéticos y bebidas
          saludables, pensados para acompañar tu día a día con opciones
          conscientes y de calidad.
        </p>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-screen-xl px-4 pb-16">
        <h2 className="mb-6 text-center text-2xl font-semibold">Categorías</h2>
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group min-w-[110px] snap-start flex-shrink-0 text-center"
            >
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-green-600 bg-white shadow transition-all duration-300 group-hover:scale-105 group-hover:border-green-700">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-green-50 text-green-700 text-sm">
                    {category.name}
                  </div>
                )}
              </div>

              <p className="mt-2 line-clamp-2 text-sm font-medium">
                {category.name}
              </p>
            </Link>
          ))}

          {kits.length > 0 && (
            <Link
              href="/kits"
              className="group min-w-[110px] snap-start flex-shrink-0 text-center"
            >
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-green-600 bg-white shadow transition-all duration-300 group-hover:scale-105 group-hover:border-green-700">
                <Image
                  src={kits[0].image_url}
                  alt="Kits armados"
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              <p className="p-2 text-center text-sm font-medium">
                Kits armados
              </p>
            </Link>
          )}
        </div>
        {/* <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group overflow-hidden rounded-xl border"
            >
              <div className="relative aspect-square bg-gray-100">
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover transition group-hover:scale-105"                    
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-green-50 text-green-700">
                    {category.name}
                  </div>
                )}
              </div>
              <p className="p-2 text-center text-sm font-medium">
                {category.name}
              </p>
            </Link>
          ))}

          {kits.length > 0 && (
            <Link
              href="/kits"
              className="group overflow-hidden rounded-xl border"
            >
              <div className="relative aspect-square bg-gray-100">
                <Image
                  src={kits[0].image_url}
                  alt="Kits armados"
                  fill
                  className="object-cover transition group-hover:scale-105"
                />
              </div>
              <p className="p-2 text-center text-sm font-medium">
                Kits armados
              </p>
            </Link>
          )}
        </div> */}
      </section>
    </div>
  );
}
