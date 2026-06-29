import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { MenuSubNav } from "./_components/menu-sub-nav";
import { loadAdminMenu } from "./load-admin-menu";

export default async function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ t }, menu] = await Promise.all([getTranslations(), loadAdminMenu()]);

  return (
    <div className="mx-auto max-w-5xl px-4">
      <div className="sticky top-0 z-10 -mx-4 border-b border-neutral-200/80 bg-neutral-50/95 px-4 py-6 backdrop-blur-sm supports-[backdrop-filter]:bg-neutral-50/80">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
              {t("dashboard.navManagement")}
            </p>
            <h1 className="mt-1 text-2xl font-medium text-neutral-900">
              {menu?.name ?? t("dashboard.noMenu")}
            </h1>
          </div>

          <Link
            href="/menu"
            className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50"
          >
            {t("dashboard.viewPublicMenu")}
          </Link>
        </div>

        {menu ? (
          <div className="mt-6">
            <MenuSubNav />
          </div>
        ) : null}
      </div>

      <div className="py-8">{children}</div>
    </div>
  );
}
