import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { resolveAdminError } from "@/i18n";
import { loadAdminMenu } from "../load-admin-menu";
import { CategoriesMasterList } from "../_components/categories-master-list";
import { MenuEmptyState } from "../_components/menu-empty-state";
import { MenuErrorAlert } from "../_components/menu-error-alert";
import { MenuPageHeader } from "../_components/menu-page-header";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("menuNav.categories") };
}

export default async function CategoriesMasterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const [{ t }, menu] = await Promise.all([getTranslations(), loadAdminMenu()]);
  const errorMessage = resolveAdminError(
    t,
    params.error,
    extractAdminErrorParams(params),
  );

  if (!menu) {
    return <MenuEmptyState />;
  }

  return (
    <div className="space-y-6">
      <MenuPageHeader
        title={t("menuNav.categories")}
        description={t("dashboard.categoriesMasterDescription")}
        action={
          <Link
            href="/dashboard/menu/categories/new"
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {t("dashboard.newCategory")}
          </Link>
        }
      />

      {errorMessage ? <MenuErrorAlert message={errorMessage} /> : null}

      <CategoriesMasterList menu={menu} />
    </div>
  );
}
