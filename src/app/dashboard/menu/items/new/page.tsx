import { notFound, redirect } from "next/navigation";
import { EMPTY_ITEM_FORM_VALUES } from "@/menu/application/admin/item-form-types";
import { loadAllergenOptions } from "@/menu/infrastructure/persistence/load-allergens";
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
  const categoryId = params.categoryId;

  if (!categoryId) {
    redirect("/dashboard/menu");
  }

  const [{ t }, menu, allergens] = await Promise.all([
    getTranslations(),
    loadAdminMenu(),
    loadAllergenOptions(),
  ]);
  const category = menu?.findCategory(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <ItemForm
      categoryId={categoryId}
      initial={EMPTY_ITEM_FORM_VALUES}
      allergens={allergens}
      title={t("dashboard.newItemIn", { category: category.name })}
      error={params.error}
      errorParams={extractAdminErrorParams(params)}
    />
  );
}
