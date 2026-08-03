import Link from "next/link";
import { auth } from "@/auth";
import MobileMenu from "./mobile-menu";
import HeaderAuthLink from '@/app/ui/header-auth-link';

const links = [
  { name: "Inicio", href: "/" },
  { name: "Productos", href: "/products" },
  { name: "Contacto", href: "/contact" },
];

export default async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const authLink = isLoggedIn
    ? { name: "Panel admin", href: "/dashboard" }
    : { name: "Iniciar sesión", href: "/login" };

  return (
    <header className="relative z-50 flex items-center justify-between border-b px-4 py-4 md:px-8">
      <Link href="/" className="text-lg font-semibold">
        Mi Tienda
      </Link>

      <nav className="hidden items-center gap-6 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hover:text-gray-600"
          >
            {link.name}
          </Link>
        ))}
        <HeaderAuthLink authLink={authLink} isLoggedIn={isLoggedIn} />
      </nav>

      <MobileMenu authLink={authLink} isLoggedIn={isLoggedIn} />
    </header>
  );
}
