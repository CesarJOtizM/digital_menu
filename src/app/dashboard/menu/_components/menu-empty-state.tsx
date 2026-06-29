import { getTranslations } from "@/i18n/server";

export async function MenuEmptyState() {
  const { t } = await getTranslations();

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <h2 className="text-lg font-medium text-amber-950">
        {t("dashboard.noMenuToManage")}
      </h2>
      <p className="mt-2 text-sm text-amber-900">
        {t("dashboard.runSeed")}{" "}
        <code className="rounded bg-amber-100 px-1.5 py-0.5">pnpm db:seed</code>{" "}
        {t("dashboard.seedHint")}
      </p>
    </section>
  );
}
