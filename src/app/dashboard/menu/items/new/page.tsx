import { notFound, redirect } from "next/navigation";
import { EMPTY_ITEM_FORM_VALUES } from "@/menu/application/admin/item-form-types";
import { loadAllergenOptions } from "@/menu/infrastructure/persistence/load-allergens";
import { ItemForm } from "../../_components/item-form";
import { loadAdminMenu } from "../../load-admin-menu";

export const metadata = {
  title: "Nuevo plato",
};

export default async function NewItemPage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; error?: string }>;
}) {
  const { categoryId, error } = await searchParams;

  if (!categoryId) {
    redirect("/dashboard/menu");
  }

  const [menu, allergens] = await Promise.all([
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
      title={`Nuevo plato en ${category.name}`}
      error={error}
    />
  );
}
