import Link from "next/link";
import Image from "next/image";
import { fetchCategoriesWithImage, fetchPublicKits } from "@/app/lib/data";
import {
  Truck,
  ShieldCheck,
  BadgePercent,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import HeroCarousel from "@/app/ui/hero-carousel";
import CategoryCarousel from "@/app/ui/category-carousel";

const heroSlides = [
  { image: "/hero/slide-1.webp" },
  { image: "/hero/slide-2.webp" },
  { image: "/hero/slide-3.webp" },
];

export default async function HomePage() {
  const categories = await fetchCategoriesWithImage();
  const kits = await fetchPublicKits();

  const features = [
    {
      icon: Truck,
      title: "Envíos",
      description: "Consultá cobertura y costos.",
    },
    {
      icon: ShieldCheck,
      title: "Compra segura",
      description: "Tus datos siempre protegidos.",
    },
    {
      icon: BadgePercent,
      title: "Promociones",
      description: "Ofertas todas las semanas.",
    },
    {
      icon: MessageCircle,
      title: "Atención personalizada",
      description: "Respondemos tus consultas.",
    },
  ];

  return (
    <div>
      <br />
      {/* Carrusel hero (reemplaza la franja verde) */}
      <HeroCarousel slides={heroSlides} />
      
      {/* Categorías */}
      <section className="bg-gradient-to-br from-green-300 to-green-500 px-4 py-16 text-white">
        <div className="mx-auto max-w-screen-xl">
          <h2 className="mb-6 text-center text-2xl font-semibold">
            Categorías
          </h2>
          <CategoryCarousel categories={categories} kits={kits} />
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

      {/* Features */}
      <section className="border-y bg-white">
        <div className="mx-auto grid max-w-screen-xl grid-cols-2 gap-8 px-4 py-8 md:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className="text-center">
                <Icon className="mx-auto mb-3 h-8 w-8 text-green-600" />
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
