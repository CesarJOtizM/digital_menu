import { getTranslations } from "@/i18n/server";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { CategoryForm } from "../../_components/category-form";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("dashboard.newCategoryTitle") };
}

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { t } = await getTranslations();

  return (
    <CategoryForm
      title={t("dashboard.newCategoryTitle")}
      error={params.error}
      errorParams={extractAdminErrorParams(params)}
    />
  );
}
