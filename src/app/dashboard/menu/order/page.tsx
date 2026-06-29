import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { resolveAdminError } from "@/i18n";
import { loadAdminMenu } from "../load-admin-menu";
import { MenuEmptyState } from "../_components/menu-empty-state";
import { MenuErrorAlert } from "../_components/menu-error-alert";
import { MenuOrderPreview } from "../_components/menu-order-preview";
import { MenuPageHeader } from "../_components/menu-page-header";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("menuNav.order") };
}

export default async function MenuOrderPage({
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
        title={t("menuNav.order")}
        description={t("dashboard.orderPageDescription")}
        action={
          <Link
            href="/menu"
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm hover:bg-stone-50"
          >
            {t("dashboard.previewLiveMenu")}
          </Link>
        }
      />

      {errorMessage ? <MenuErrorAlert message={errorMessage} /> : null}

      <MenuOrderPreview menu={menu} />
    </div>
  );
}
