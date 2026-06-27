"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Resumen", exact: true },
  { href: "/dashboard/menu", label: "Gestionar carta", exact: false },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={
              active
                ? "rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
