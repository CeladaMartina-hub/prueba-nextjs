import Link from 'next/link';
import { auth } from '@/auth';
import MobileMenu from './mobile-menu';

const links = [
  { name: 'Inicio', href: '/' },
  { name: 'Productos', href: '/products' },
  { name: 'Contacto', href: '/contact' },
];

export default async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const authLink = isLoggedIn
    ? { name: 'Panel admin', href: '/dashboard' }
    : { name: 'Iniciar sesión', href: '/login' };

  return (
    <header className="relative flex items-center justify-between border-b px-4 py-4 md:px-8">
      <Link href="/" className="text-lg font-semibold">
        Mi Tienda
      </Link>

      <nav className="hidden items-center gap-6 md:flex">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="hover:text-gray-600">
            {link.name}
          </Link>
        ))}
        <Link
          href={authLink.href}
          className="rounded-md border px-3 py-1.5 hover:bg-gray-100"
        >
          {authLink.name}
        </Link>
      </nav>

      <MobileMenu authLink={authLink} />
    </header>
  );
}