import { requireAuthUser, signOutAction } from "@/shared/infrastructure/auth";
import { DashboardNav } from "./_components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuthUser();

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Panel administrador
            </p>
            <DashboardNav />
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-600 sm:inline">
              {user.email}
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
