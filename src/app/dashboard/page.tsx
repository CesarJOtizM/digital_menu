import Link from "next/link";
import { getAuthUser } from "@/shared/infrastructure/auth";
import { getTranslations } from "@/i18n/server";
import { pluralize } from "@/i18n";
import { loadDashboardOverview } from "./load-dashboard-overview";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("dashboard.title") };
}

function StatusBadge({
  status,
  publishedLabel,
  draftLabel,
}: {
  status: string;
  publishedLabel: string;
  draftLabel: string;
}) {
  const isPublished = status === "published";

  return (
    <span
      className={
        isPublished
          ? "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800"
          : "rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-700"
      }
    >
      {isPublished ? publishedLabel : draftLabel}
    </span>
  );
}

export default async function DashboardPage() {
  const [{ t }, user, overview] = await Promise.all([
    getTranslations(),
    getAuthUser(),
    loadDashboardOverview(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="border-b border-neutral-200 pb-6">
        <h1 className="text-2xl font-medium">{overview.restaurantName}</h1>
        <p className="mt-1 text-sm text-neutral-600">
          {t("dashboard.session")} {user?.email ?? t("dashboard.administrator")}
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            {t("dashboard.categories")}
          </p>
          <p className="mt-2 text-3xl font-medium">
            {overview.menu?.categoryCount ?? 0}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            {t("dashboard.items")}
          </p>
          <p className="mt-2 text-3xl font-medium">
            {overview.menu?.itemCount ?? 0}
          </p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-neutral-500">
            {t("dashboard.status")}
          </p>
          <div className="mt-3">
            {overview.menu ? (
              <StatusBadge
                status={overview.menu.status}
                publishedLabel={t("dashboard.published")}
                draftLabel={t("dashboard.draft")}
              />
            ) : (
              <span className="text-sm text-neutral-600">{t("dashboard.noMenu")}</span>
            )}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="text-lg font-medium">{t("dashboard.quickLinks")}</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/dashboard/menu"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {t("dashboard.manageMenu")}
          </Link>
          <Link
            href="/menu"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            {t("dashboard.viewPublicMenu")}
          </Link>
          <Link
            href="/"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            {overview.landingEnabled
              ? t("dashboard.viewLanding")
              : t("dashboard.viewHome")}
          </Link>
        </div>
      </section>

      {overview.menu ? (
        <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">{overview.menu.name}</h2>
              <p className="mt-1 text-sm text-neutral-600">
                {t("dashboard.categorySummary")}
              </p>
            </div>
            <StatusBadge
              status={overview.menu.status}
              publishedLabel={t("dashboard.published")}
              draftLabel={t("dashboard.draft")}
            />
          </div>

          {overview.menu.categories.length > 0 ? (
            <ul className="mt-5 divide-y divide-neutral-100">
              {overview.menu.categories.map((category) => (
                <li
                  key={category.name}
                  className="flex items-center justify-between py-3 text-sm"
                >
                  <span className="font-medium">{category.name}</span>
                  <span className="text-neutral-500">
                    {category.itemCount}{" "}
                    {pluralize(
                      category.itemCount,
                      t("dashboard.item_one"),
                      t("dashboard.item_other"),
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-neutral-600">
              {t("dashboard.noCategoriesYet")}
            </p>
          )}
        </section>
      ) : (
        <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-lg font-medium text-amber-950">
            {t("dashboard.noPublishedMenu")}
          </h2>
          <p className="mt-2 text-sm text-amber-900">
            {t("dashboard.runSeed")}{" "}
            <code className="rounded bg-amber-100 px-1.5 py-0.5">
              pnpm db:seed
            </code>{" "}
            {t("dashboard.seedHint")}
          </p>
        </section>
      )}
    </main>
  );
}
