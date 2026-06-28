import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { extractAdminErrorParams } from "@/i18n/extract-admin-error-params";
import { resolveAdminError } from "@/i18n";
import { loadAllergenOptions } from "@/menu/infrastructure/persistence/load-allergens";
import { deleteAllergenAction } from "../allergen-actions";

export async function generateMetadata() {
  const { t } = await getTranslations();
  return { title: t("allergens.manage") };
}

export default async function AllergensPage({
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
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/dashboard/menu"
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        {t("dashboard.backToMenu")}
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium">{t("allergens.manage")}</h1>
          <p className="mt-1 text-sm text-neutral-600">{t("allergens.subtitle")}</p>
        </div>

        <Link
          href="/dashboard/menu/allergens/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          {t("allergens.add")}
        </Link>
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      {allergens.length === 0 ? (
        <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-sm text-neutral-600">{t("allergens.empty")}</p>
        </section>
      ) : (
        <ul className="mt-8 divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
          {allergens.map((allergen) => (
            <li
              key={allergen.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
            >
              <div>
                <p className="font-medium">{allergen.name}</p>
                {allergen.icon ? (
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {t("allergens.iconLabel")}: {allergen.icon}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/menu/allergens/${allergen.id}`}
                  className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50"
                >
                  {t("common.edit")}
                </Link>
                <form action={deleteAllergenAction}>
                  <input type="hidden" name="allergenId" value={allergen.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                  >
                    {t("common.delete")}
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
