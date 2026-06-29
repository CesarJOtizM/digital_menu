import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { pluralize } from "@/i18n";
import { localizedName } from "@/menu/presentation/localize-menu-content";
import type { Menu } from "@/menu/domain";
import { adminActionSecondaryMdClass } from "../../_components/admin-action-styles";
import { deleteCategoryAction } from "../actions";
import { ConfirmDeleteButton } from "./confirm-delete-button";

interface CategoriesMasterListProps {
  menu: Menu;
}

export async function CategoriesMasterList({ menu }: CategoriesMasterListProps) {
  const { t, locale } = await getTranslations();
  const categories = menu.categories;

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-12 text-center">
        <p className="text-sm text-neutral-600">{t("dashboard.noCategoriesYet")}</p>
        <Link
          href="/dashboard/menu/categories/new"
          className="mt-4 inline-flex rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {t("dashboard.newCategory")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-neutral-100 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      {categories.map((category) => {
        const categoryName = localizedName(category, locale);

        return (
        <li
          key={category.id}
          className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 hover:bg-neutral-50/50"
        >
          <div className="min-w-0">
            <p className="font-medium text-neutral-900">{categoryName}</p>
            <p className="mt-0.5 text-sm text-neutral-500">
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
              className={adminActionSecondaryMdClass}
            >
              {t("common.edit")}
            </Link>
            <ConfirmDeleteButton
              action={deleteCategoryAction}
              fields={{ categoryId: category.id }}
              itemName={categoryName}
            />
          </div>
        </li>
        );
      })}
    </ul>
  );
}
