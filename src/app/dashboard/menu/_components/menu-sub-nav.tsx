"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "@/i18n";

const TABS = [
  {
    href: "/dashboard/menu/order",
    key: "menuNav.order",
    isMaster: false,
    isActive: (pathname: string) =>
      pathname === "/dashboard/menu/order" || pathname === "/dashboard/menu",
  },
  {
    href: "/dashboard/menu/items",
    key: "menuNav.items",
    isMaster: false,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/menu/items"),
  },
  {
    href: "/dashboard/menu/categories",
    key: "menuNav.categories",
    isMaster: true,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/menu/categories"),
  },
  {
    href: "/dashboard/menu/allergens",
    key: "menuNav.allergens",
    isMaster: true,
    isActive: (pathname: string) => pathname.startsWith("/dashboard/menu/allergens"),
  },
] as const;

export function MenuSubNav() {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <nav
      aria-label={t("menuNav.ariaLabel")}
      className="overflow-x-auto pb-1"
    >
      <div className="flex min-w-max gap-2 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-sm">
        {TABS.map((tab) => {
          const active = tab.isActive(pathname);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white"
                  : "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
              }
            >
              <span>{t(tab.key)}</span>
              {tab.isMaster ? (
                <span
                  className={
                    active
                      ? "rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      : "rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-neutral-500"
                  }
                >
                  {t("menuNav.masterBadge")}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
