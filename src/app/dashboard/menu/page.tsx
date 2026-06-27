import Link from "next/link";
import { createPriceFormatter } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { deleteCategoryAction, deleteItemAction, toggleItemActiveAction } from "./actions";
import { loadAdminMenu } from "./load-admin-menu";

export const metadata = {
  title: "Gestionar carta",
};

export default async function AdminMenuPage() {
  const [menu, config] = await Promise.all([loadAdminMenu(), getConfig()]);
  const formatPrice = createPriceFormatter({
    locale: config.locale,
    currency: config.currency,
    showSymbol: config.showCurrencySymbol,
  });

  if (!menu) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-xl font-medium text-amber-950">
            No hay carta para gestionar
          </h1>
          <p className="mt-2 text-sm text-amber-900">
            Ejecuta{" "}
            <code className="rounded bg-amber-100 px-1.5 py-0.5">pnpm db:seed</code>{" "}
            para cargar datos de ejemplo.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">Gestionar carta</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {menu.name} · {menu.categories.length} categorías
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/menu/categories/new"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white"
          >
            Nueva categoría
          </Link>
          <Link
            href="/menu"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Ver carta pública
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        {menu.categories.map((category) => (
          <section
            key={category.id}
            className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 pb-4">
              <div>
                <h2 className="text-lg font-medium">{category.name}</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {category.items.length}{" "}
                  {category.items.length === 1 ? "plato" : "platos"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/menu/categories/${category.id}`}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  Editar categoría
                </Link>
                <Link
                  href={`/dashboard/menu/items/new?categoryId=${category.id}`}
                  className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  Agregar plato
                </Link>
              </div>
            </div>

            {category.items.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">
                Esta categoría no tiene platos todavía.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-neutral-100">
                {category.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        {!item.active ? (
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600">
                            Inactivo
                          </span>
                        ) : null}
                        {item.variants.length > 0 ? (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {item.variants.length} variantes
                          </span>
                        ) : null}
                        {item.modifierGroups.length > 0 ? (
                          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
                            {item.modifierGroups.length} mods
                          </span>
                        ) : null}
                      </div>
                      {item.description ? (
                        <p className="mt-1 line-clamp-2 text-sm text-neutral-500">
                          {item.description}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm text-neutral-700">
                        {item.basePrice.toDisplay(formatPrice)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <form action={toggleItemActiveAction}>
                        <input type="hidden" name="categoryId" value={category.id} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className={
                            item.active
                              ? "rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-100"
                              : "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50"
                          }
                        >
                          {item.active ? "Activo" : "Inactivo"}
                        </button>
                      </form>

                      <Link
                        href={`/dashboard/menu/items/${item.id}?categoryId=${category.id}`}
                        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                      >
                        Editar
                      </Link>

                      <form action={deleteItemAction}>
                        <input type="hidden" name="categoryId" value={category.id} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                        >
                          Eliminar
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form action={deleteCategoryAction} className="mt-4 border-t border-neutral-100 pt-4">
              <input type="hidden" name="categoryId" value={category.id} />
              <button
                type="submit"
                className="text-sm text-red-700 hover:underline"
              >
                Eliminar categoría
              </button>
            </form>
          </section>
        ))}
      </div>
    </main>
  );
}
