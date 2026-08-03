"use client";

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ShoppingCartIcon,
  StarIcon,
  Square2StackIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { GiftIcon } from "lucide-react";

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    color: "bg-blue-50 text-blue-600",
  },
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

export default function NavLinks() {
  const pathname = usePathname();

  if (pathname === "/dashboard") {
    return null;
  }

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              "flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3",
              {
                "bg-sky-100 text-blue-600": pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
