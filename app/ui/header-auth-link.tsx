"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserIcon } from "@heroicons/react/24/outline";

export default function HeaderAuthLink({
  authLink,
  isLoggedIn,
}: {
  authLink: { name: string; href: string };
  isLoggedIn: boolean;
}) {
  const pathname = usePathname();

  if (isLoggedIn && pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <Link
      href={authLink.href}
      aria-label={authLink.name}
      title={authLink.name}
      className="rounded-full p-2 hover:bg-gray-100"
    >
      <UserIcon className="h-6 w-6" />
    </Link>
  );
}
