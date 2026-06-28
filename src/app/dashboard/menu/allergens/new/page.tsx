import { getTranslations } from "@/i18n/server";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { AllergenForm } from "../../_components/allergen-form";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("allergens.add") };
}

export default async function NewAllergenPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { t } = await getTranslations();

  return (
    <AllergenForm
      title={t("allergens.add")}
      error={params.error}
      errorParams={extractAdminErrorParams(params)}
    />
  );
}
