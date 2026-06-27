import Link from "next/link";
import { getAuthUser } from "@/shared/infrastructure/auth";
import { loadDashboardOverview } from "./load-dashboard-overview";

export const metadata = {
  title: "Dashboard",
};

function StatusBadge({ status }: { status: string }) {
  const isPublished = status === "published";

  return (
    <span
      className={
        isPublished
          ? "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
          : "rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700"
      }
    >
      {isPublished ? "Publicada" : "Borrador"}
    </span>
  );
}

export default async function DashboardPage() {
  const [user, overview] = await Promise.all([
    getAuthUser(),
    loadDashboardOverview(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="border-b border-neutral-200 pb-6">
        <h1 className="text-2xl font-medium">{overview.restaurantName}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Sesión: {user?.email ?? "administrador"}
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Categorías
          </p>
          <p className="mt-2 text-3xl font-medium">
            {overview.menu?.categoryCount ?? 0}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Platos
          </p>
          <p className="mt-2 text-3xl font-medium">
            {overview.menu?.itemCount ?? 0}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            Estado
          </p>
          <div className="mt-3">
            {overview.menu ? (
              <StatusBadge status={overview.menu.status} />
            ) : (
              <span className="text-sm text-neutral-600">Sin carta</span>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-medium">Accesos rápidos</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard/menu"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Gestionar carta
          </Link>
          <Link
            href="/menu"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Ver carta pública
          </Link>
          <Link
            href="/"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            {overview.landingEnabled ? "Ver landing" : "Ver inicio"}
          </Link>
        </div>
      </section>

      {overview.menu ? (
        <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">{overview.menu.name}</h2>
              <p className="mt-1 text-sm text-neutral-600">
                Resumen de categorías publicadas
              </p>
            </div>
            <StatusBadge status={overview.menu.status} />
          </div>

          {overview.menu.categories.length > 0 ? (
            <ul className="mt-5 divide-y divide-neutral-100">
              {overview.menu.categories.map((category) => (
                <li
                  key={category.name}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="font-medium">{category.name}</span>
                  <span className="text-neutral-500">
                    {category.itemCount}{" "}
                    {category.itemCount === 1 ? "plato" : "platos"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-600">
              La carta no tiene categorías todavía.
            </p>
          )}
        </section>
      ) : (
        <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-medium text-amber-950">
            No hay carta publicada
          </h2>
          <p className="mt-2 text-sm text-amber-900">
            Ejecuta{" "}
            <code className="rounded bg-amber-100 px-1.5 py-0.5">
              pnpm db:seed
            </code>{" "}
            para cargar los datos de ejemplo.
          </p>
        </section>
      )}
    </main>
  );
}
