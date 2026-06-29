import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { resolveAdminError } from "@/i18n";
import { loadAdminMenu } from "../load-admin-menu";
import { ItemsMasterList } from "../_components/items-master-list";
import { MenuEmptyState } from "../_components/menu-empty-state";
import { MenuErrorAlert } from "../_components/menu-error-alert";
import { MenuPageHeader } from "../_components/menu-page-header";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("menuNav.items") };
}

export default async function ItemsMasterPage({
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

  const newItemHref =
    menu.categories.length === 1
      ? `/dashboard/menu/items/new?categoryId=${menu.categories[0].id}`
      : "/dashboard/menu/items/new";

  return (
    <div className="space-y-6">
      <MenuPageHeader
        title={t("menuNav.items")}
        description={t("dashboard.itemsMasterDescription")}
        action={
          <Link
            href={newItemHref}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {t("dashboard.addItem")}
          </Link>
        }
      />

      {errorMessage ? <MenuErrorAlert message={errorMessage} /> : null}

      <ItemsMasterList menu={menu} />
    </div>
  );
}
