import Link from "next/link";
import {
  UserGroupIcon,
  StarIcon,
  Square2StackIcon,
  ShoppingCartIcon,
  DocumentDuplicateIcon,
  PowerIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";
import {
  fetchCustomers,
  fetchProducts,
  fetchCategories,
  fetchSales,
} from "@/app/lib/data";
import { signOut } from "@/auth";

const cards = [
  {
    name: "Productos",
    href: "/dashboard/products",
    icon: StarIcon,
    color: "bg-blue-50 text-blue-600",
  },
   {
    name: "Kits",
    href: "/dashboard/kits",
    icon: GiftIcon,
    color: "bg-rose-50 text-rose-600",
  },
  {
    name: "Clientes",
    href: "/dashboard/customers",
    icon: UserGroupIcon,
    color: "bg-purple-50 text-purple-600",
  },
  {
    name: "Categorías",
    href: "/dashboard/categories",
    icon: Square2StackIcon,
    color: "bg-amber-50 text-amber-600",
  },
  {
    name: "Ventas",
    href: "/dashboard/sales",
    icon: ShoppingCartIcon,
    color: "bg-green-50 text-green-600",
  },
  {
    name: "Reportes",
    href: "/dashboard/reports",
    icon: DocumentDuplicateIcon,
    color: "bg-rose-50 text-rose-600",
  },
  {
    name: "Gastos",
    href: "/dashboard/purchases",
    icon: DocumentDuplicateIcon,
    color: "bg-rose-50 text-rose-600",
  } 
];

export default async function Page() {
  return (
    <div className="w-full">
      <h1 className="text-2xl">Panel de administración</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.name}
              href={card.href}
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border bg-white p-8 text-center transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${card.color}`}
              >
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-lg font-medium">{card.name}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
