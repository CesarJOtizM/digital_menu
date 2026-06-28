import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { resolveAdminError, type TranslationParams } from "@/i18n";
import { saveAllergenAction } from "../allergen-actions";

interface AllergenFormProps {
  allergenId?: string;
  initialName?: string;
  initialIcon?: string;
  title: string;
  error?: string;
  errorParams?: TranslationParams;
}

export async function AllergenForm({
  allergenId,
  initialName = "",
  initialIcon = "",
  title,
  error,
  errorParams,
}: AllergenFormProps) {
  const { t } = await getTranslations();
  const errorMessage = resolveAdminError(t, error, errorParams);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/dashboard/menu/allergens"
        className="text-sm text-neutral-500 hover:text-neutral-800"
      >
        {t("allergens.backToList")}
      </Link>

      <h1 className="mt-4 text-2xl font-medium">{title}</h1>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      <form
        action={saveAllergenAction}
        className="mt-8 space-y-5 rounded-lg border border-neutral-200 bg-white p-5"
      >
        {allergenId ? (
          <input type="hidden" name="allergenId" value={allergenId} />
        ) : null}

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            {t("allergens.name")}
          </label>
          <input
            id="name"
            name="name"
            required
            defaultValue={initialName}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="icon" className="text-sm font-medium">
            {t("allergens.icon")}
          </label>
          <input
            id="icon"
            name="icon"
            defaultValue={initialIcon}
            placeholder={t("allergens.iconPlaceholder")}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <p className="text-xs text-neutral-500">{t("allergens.iconHint")}</p>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            {t("allergens.save")}
          </button>
          <Link
            href="/dashboard/menu/allergens"
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            {t("common.cancel")}
          </Link>
        </div>
      </form>
    </main>
  );
}
