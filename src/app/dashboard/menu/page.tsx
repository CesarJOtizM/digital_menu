import Link from "next/link";
import { createPriceFormatter } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { getTranslations } from "@/i18n/server";
import { pluralize } from "@/i18n";
import { deleteCategoryAction, deleteItemAction, toggleItemActiveAction } from "./actions";
import { loadAdminMenu } from "./load-admin-menu";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("dashboard.manageMenu") };
}

export default async function AdminMenuPage() {
  const [{ t }, menu, config] = await Promise.all([
    getTranslations(),
    loadAdminMenu(),
    getConfig(),
  ]);
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
            {t("dashboard.noMenuToManage")}
          </h1>
          <p className="mt-2 text-sm text-amber-900">
            {t("dashboard.runSeed")}{" "}
            <code className="rounded bg-amber-100 px-1.5 py-0.5">pnpm db:seed</code>{" "}
            {t("dashboard.seedHint")}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">{t("dashboard.manageMenu")}</h1>
          <p className="mt-1 text-sm text-neutral-600">
            {menu.name} · {t("dashboard.categoryCount", { count: menu.categories.length })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/menu/categories/new"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white"
          >
            {t("dashboard.newCategory")}
          </Link>
          <Link
            href="/dashboard/menu/allergens"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white"
          >
            {t("allergens.manage")}
          </Link>
          <Link
            href="/menu"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {t("dashboard.viewPublicMenu")}
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
                  {pluralize(
                    category.items.length,
                    t("dashboard.item_one"),
                    t("dashboard.item_other"),
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/menu/categories/${category.id}`}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  {t("dashboard.editCategory")}
                </Link>
                <Link
                  href={`/dashboard/menu/items/new?categoryId=${category.id}`}
                  className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
                >
                  {t("dashboard.addItem")}
                </Link>
              </div>
            </div>

            {category.items.length === 0 ? (
              <p className="mt-4 text-sm text-neutral-500">
                {t("dashboard.emptyCategory")}
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
                            {t("dashboard.inactive")}
                          </span>
                        ) : null}
                        {item.variants.length > 0 ? (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                            {t("dashboard.variants", { count: item.variants.length })}
                          </span>
                        ) : null}
                        {item.modifierGroups.length > 0 ? (
                          <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-700">
                            {t("dashboard.mods", { count: item.modifierGroups.length })}
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
                          {item.active ? t("dashboard.active") : t("dashboard.inactive")}
                        </button>
                      </form>

                      <Link
                        href={`/dashboard/menu/items/${item.id}?categoryId=${category.id}`}
                        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                      >
                        {t("common.edit")}
                      </Link>

                      <form action={deleteItemAction}>
                        <input type="hidden" name="categoryId" value={category.id} />
                        <input type="hidden" name="itemId" value={item.id} />
                        <button
                          type="submit"
                          className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                        >
                          {t("common.delete")}
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
                {t("dashboard.deleteCategory")}
              </button>
            </form>
          </section>
        ))}
      </div>
    </main>
  );
}
