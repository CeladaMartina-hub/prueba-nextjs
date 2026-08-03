'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const links = [
  { name: 'Inicio', href: '/' },
  { name: 'Productos', href: '/products' }
];

export default function MobileMenu({
  authLink,
}: {
  authLink: { name: string; href: string };
}) {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="absolute left-0 right-0 top-16 flex flex-col gap-1 border-t bg-white p-4 shadow-md">
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
          <Link
            href={authLink.href}
            onClick={() => setIsOpen(false)}
            className="rounded-md p-2 hover:bg-gray-100"
          >
            {authLink.name}
          </Link>
        </div>
      )}
    </div>
  );
}