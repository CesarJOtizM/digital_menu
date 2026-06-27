import { CategoryForm } from "../../_components/category-form";

export const metadata = {
  title: "Nueva categoría",
};

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return <CategoryForm title="Nueva categoría" error={error} />;
}
