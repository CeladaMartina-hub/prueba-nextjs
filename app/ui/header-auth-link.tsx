'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HeaderAuthLink({
  authLink,
  isLoggedIn,
}: {
  authLink: { name: string; href: string };
  isLoggedIn: boolean;
}) {
  const pathname = usePathname();

  if (isLoggedIn && pathname.startsWith('/dashboard')) {
    return null;
  }

  return (
    <Link
      href={authLink.href}
      className="rounded-md border px-3 py-1.5 hover:bg-gray-100"
    >
      {authLink.name}
    </Link>
  );
}