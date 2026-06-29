import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { resolveAdminError, type TranslationParams } from "@/i18n";
import { adminActionCancelClass } from "../../_components/admin-action-styles";
import { FormSubmitButton } from "../../_components/form-submit-button";
import {
  ContentLocaleField,
  ContentLocaleTabs,
} from "./content-locale-tabs";
import { saveCategoryAction } from "../actions";

interface CategoryFormProps {
  categoryId?: string;
  initialName?: string;
  initialNameEn?: string;
  title: string;
  error?: string;
  errorParams?: TranslationParams;
}

export async function CategoryForm({
  categoryId,
  initialName = "",
  initialNameEn = "",
  title,
  error,
  errorParams,
}: CategoryFormProps) {
  const { t } = await getTranslations();
  const errorMessage = resolveAdminError(t, error, errorParams);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-medium">{title}</h1>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {errorMessage}
        </p>
      ) : null}

      <form
        action={saveCategoryAction}
        className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5"
      >
        {categoryId ? <input type="hidden" name="categoryId" value={categoryId} /> : null}
        <input type="hidden" name="returnTo" value="/dashboard/menu/categories" />

        <ContentLocaleTabs
          esPanel={
            <ContentLocaleField
              id="name"
              label={t("dashboard.categoryName")}
              name="name"
              defaultValue={initialName}
              required
            />
          }
          enPanel={
            <ContentLocaleField
              id="nameEn"
              label={t("dashboard.categoryName")}
              name="nameEn"
              defaultValue={initialNameEn}
              hint={t("contentLocale.optionalHint")}
            />
          }
        />

        <div className="flex flex-wrap gap-3 pt-2">
          <FormSubmitButton variant="primary">
            {t("dashboard.saveCategory")}
          </FormSubmitButton>
          <Link
            href="/dashboard/menu/categories"
            className={adminActionCancelClass}
          >
            {t("common.cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
