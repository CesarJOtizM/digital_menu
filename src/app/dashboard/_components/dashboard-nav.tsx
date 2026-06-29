"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n";

const LINKS = [
  { href: "/dashboard", key: "dashboard.navHome", exact: true },
  { href: "/dashboard/menu", key: "dashboard.navManagement", exact: false },
  { href: "/dashboard/settings", key: "dashboard.navSettings", exact: true },
] as const;

type DashboardNavProps = {
  orientation?: "horizontal" | "vertical";
};

export function DashboardNav({ orientation = "vertical" }: DashboardNavProps) {
  const pathname = usePathname();
  const t = useTranslations();
  const isVertical = orientation === "vertical";

  return (
    <nav
      aria-label={t("dashboard.adminPanel")}
      className={
        isVertical
          ? "flex flex-col gap-1 px-3 py-2"
          : "flex flex-wrap gap-2"
      }
    >
      {LINKS.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? isVertical
                  ? "rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
                  : "rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
                : isVertical
                  ? "rounded-md px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  : "rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
            }
          >
            {t(link.key)}
          </Link>
        );
      })}
    </nav>
  );
}
