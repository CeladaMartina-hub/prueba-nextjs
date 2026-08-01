import Link from 'next/link';

const links = [
  { name: 'Inicio', href: '/' },
  { name: 'Productos', href: '/products' },
  { name: 'Contacto', href: '/contact' },
];

export default function Footer() {
  return (
    <footer className="border-t px-4 py-8 md:px-8">
      <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Mi Tienda. Todos los derechos reservados.
        </p>
        <nav className="flex gap-4 text-sm">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-gray-600">
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}