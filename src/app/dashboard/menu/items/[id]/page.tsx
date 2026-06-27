import { notFound } from "next/navigation";
import { loadAllergenOptions } from "@/menu/infrastructure/persistence/load-allergens";
import { ItemForm } from "../../_components/item-form";
import { itemToFormValues } from "../../item-to-form-values";
import { loadAdminMenu } from "../../load-admin-menu";

export const metadata = {
  title: "Editar plato",
};

export default async function EditItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ categoryId?: string; error?: string }>;
}) {
  const { id } = await params;
  const { categoryId, error } = await searchParams;

  if (!categoryId) {
    notFound();
  }

  const [menu, allergens] = await Promise.all([
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
      title={`Editar: ${item.name}`}
      error={error}
      initial={itemToFormValues(item)}
    />
  );
}
