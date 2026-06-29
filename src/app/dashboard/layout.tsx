import { requireAuthUser, signOutAction } from "@/shared/infrastructure/auth";
import { getTranslations } from "@/i18n/server";
import { LanguageSwitcher } from "@/i18n";
import { DashboardNav } from "./_components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [{ t }, user] = await Promise.all([getTranslations(), requireAuthUser()]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-neutral-200 bg-white md:flex">
        <div className="border-b border-neutral-200 px-4 py-5">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            {t("dashboard.adminPanel")}
          </p>
        </div>
        <DashboardNav orientation="vertical" />
      </aside>

      <div className="flex min-h-screen flex-col md:pl-56">
        <header className="sticky top-0 z-20 shrink-0 border-b border-neutral-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
            <div className="space-y-3 md:hidden">
              <p className="text-xs uppercase tracking-wide text-neutral-500">
                {t("dashboard.adminPanel")}
              </p>
              <DashboardNav orientation="horizontal" />
            </div>

            <div className="ml-auto flex items-center gap-3">
              <LanguageSwitcher />
              <span className="hidden text-sm text-neutral-600 sm:inline">
                {user.email}
              </span>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
                >
                  {t("dashboard.signOut")}
                </button>
              </form>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
