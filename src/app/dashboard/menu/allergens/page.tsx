import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { resolveAdminError } from "@/i18n";
import { loadAllergenOptions } from "@/menu/infrastructure/persistence/load-allergens";
import { AllergensMasterList } from "../_components/allergens-master-list";
import { MenuErrorAlert } from "../_components/menu-error-alert";
import { MenuPageHeader } from "../_components/menu-page-header";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("menuNav.allergens") };
}

export default async function AllergensMasterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [{ t }, allergens] = await Promise.all([
    getTranslations(),
    loadAllergenOptions(),
  ]);
  const errorMessage = resolveAdminError(
    t,
    params.error,
    extractAdminErrorParams(params),
  );

  return (
    <div className="space-y-6">
      <MenuPageHeader
        title={t("menuNav.allergens")}
        description={t("dashboard.allergensMasterDescription")}
        action={
          <Link
            href="/dashboard/menu/allergens/new"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {t("allergens.add")}
          </Link>
        }
      />

      {errorMessage ? <MenuErrorAlert message={errorMessage} /> : null}

      <AllergensMasterList allergens={allergens} />
    </div>
  );
}
