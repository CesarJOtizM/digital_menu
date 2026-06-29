import { notFound } from "next/navigation";
import { loadAllergenOptions } from "@/menu/infrastructure/persistence/load-allergens";
import { localizedName } from "@/menu/presentation/localize-menu-content";
import { getTranslations } from "@/i18n/server";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { ItemForm } from "../../_components/item-form";
import { itemToFormValues } from "../../item-to-form-values";
import { loadAdminMenu } from "../../load-admin-menu";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("dashboard.editItem") };
}

export default async function EditItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const categoryId = query.categoryId;

  if (!categoryId) {
    notFound();
  }

  const [{ t, locale }, menu, allergens] = await Promise.all([
    getTranslations(),
    loadAdminMenu(),
    loadAllergenOptions(),
  ]);
  if (!menu) {
    notFound();
  }

  const item = menu.findItem(categoryId, id);
  const category = menu.findCategory(categoryId);

  if (!item || !category) {
    notFound();
  }

  return (
    <ItemForm
      categoryId={categoryId}
      categoryName={localizedName(category, locale)}
      itemId={id}
      allergens={allergens}
      title={t("dashboard.editItemNamed", { name: localizedName(item, locale) })}
      error={query.error}
      errorParams={extractAdminErrorParams(query)}
      initial={itemToFormValues(item)}
    />
  );
}
