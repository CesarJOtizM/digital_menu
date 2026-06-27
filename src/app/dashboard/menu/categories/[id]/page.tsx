import { notFound } from "next/navigation";
import { CategoryForm } from "../../_components/category-form";
import { loadAdminMenu } from "../../load-admin-menu";

export const metadata = {
  title: "Editar categoría",
};

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const menu = await loadAdminMenu();
  const category = menu?.findCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <CategoryForm
      categoryId={id}
      initialName={category.name}
      title={`Editar categoría: ${category.name}`}
      error={error}
    />
  );
}
