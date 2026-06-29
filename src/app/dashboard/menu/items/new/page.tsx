import Link from "next/link";
import { notFound } from "next/navigation";
import { EMPTY_ITEM_FORM_VALUES } from "@/menu/application/admin/item-form-types";
import { loadAllergenOptions } from "@/menu/infrastructure/persistence/load-allergens";
import { localizedName } from "@/menu/presentation/localize-menu-content";
import { getTranslations } from "@/i18n/server";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { ItemForm } from "../../_components/item-form";
import { loadAdminMenu } from "../../load-admin-menu";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("dashboard.newItem") };
}

export default async function NewItemPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const presetCategoryId = params.categoryId;

  const [{ t, locale }, menu, allergens] = await Promise.all([
    getTranslations(),
    loadAdminMenu(),
    loadAllergenOptions(),
  ]);

  if (!menu) {
    notFound();
  }

  const categories = menu.categories.map((category) => ({
    id: category.id,
    name: localizedName(category, locale),
  }));

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-xl font-medium text-amber-950">
            {t("dashboard.noCategoriesForItems")}
          </h1>
          <Link
            href="/dashboard/menu/categories/new"
            className="mt-4 inline-block text-sm font-medium text-amber-950 underline-offset-2 hover:underline"
          >
            {t("dashboard.newCategory")}
          </Link>
        </section>
      </div>
    );
  }

  const presetCategory = presetCategoryId
    ? menu.findCategory(presetCategoryId)
    : undefined;

  if (presetCategoryId && !presetCategory) {
    notFound();
  }

  return (
    <ItemForm
      categoryId={presetCategory?.id}
      categories={categories}
      initial={EMPTY_ITEM_FORM_VALUES}
      allergens={allergens}
      title={
        presetCategory
          ? t("dashboard.newItemIn", {
              category: localizedName(presetCategory, locale),
            })
          : t("dashboard.newItem")
      }
      error={params.error}
      errorParams={extractAdminErrorParams(params)}
    />
  );
}
