import { notFound } from "next/navigation";
import { loadAllergenOptions } from "@/menu/infrastructure/persistence/load-allergens";
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

  const [{ t }, menu, allergens] = await Promise.all([
    getTranslations(),
    loadAdminMenu(),
    loadAllergenOptions(),
  ]);
  const item = menu?.findItem(categoryId, id);

  if (!menu || !item) {
    notFound();
  }

  return (
    <ItemForm
      categoryId={categoryId}
      itemId={id}
      allergens={allergens}
      title={t("dashboard.editItemNamed", { name: item.name })}
      error={query.error}
      errorParams={extractAdminErrorParams(query)}
      initial={itemToFormValues(item)}
    />
  );
}
