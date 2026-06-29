import { notFound } from "next/navigation";
import { getTranslations } from "@/i18n/server";
import { localizedName } from "@/menu/presentation/localize-menu-content";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { CategoryForm } from "../../_components/category-form";
import { loadAdminMenu } from "../../load-admin-menu";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("dashboard.editCategory") };
}

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [{ t, locale }, menu] = await Promise.all([getTranslations(), loadAdminMenu()]);
  const category = menu?.findCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <CategoryForm
      categoryId={id}
      initialName={category.name}
      initialNameEn={category.nameEn ?? ""}
      title={t("dashboard.editCategoryNamed", {
        name: localizedName(category, locale),
      })}
      error={query.error}
      errorParams={extractAdminErrorParams(query)}
    />
  );
}
