import Link from "next/link";
import { auth } from "@/auth";
import MobileMenu from "./mobile-menu";
import HeaderAuthLink from "@/app/ui/header-auth-link";
import Image from "next/image";

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
    <header className="relative z-50 flex items-center justify-between border-b px-4 py-3 md:px-8">
      <Link href="/" className="flex items-center">
        <Image
          src="/Logo.png"
          alt="Ecobocado"
          width={200}
          height={70}
          className="h-14 w-auto md:h-16"
          priority
        />
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
