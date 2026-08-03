"use client";

import { useState } from "react";
import Link from "next/link";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { usePathname } from "next/navigation";

const links = [
  { name: "Inicio", href: "/" },
  { name: "Productos", href: "/products" },
];

export default function MobileMenu({
  authLink,
  isLoggedIn,
}: {
  authLink: { name: string; href: string };
  isLoggedIn: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const showAuthLink = !(isLoggedIn && pathname.startsWith("/dashboard"));

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir menú"
        className="p-2"
      >
        {isOpen ? <XMarkIcon className="w-6" /> : <Bars3Icon className="w-6" />}
      </button>

      {isOpen && (
         <div className="absolute left-0 right-0 top-16 z-50 flex flex-col gap-1 border-t bg-white p-4 shadow-md">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              {link.name}
            </Link>
          ))}
          {showAuthLink && (
            <Link
              href={authLink.href}
              onClick={() => setIsOpen(false)}
              className="rounded-md p-2 hover:bg-gray-100"
            >
              {authLink.name}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
