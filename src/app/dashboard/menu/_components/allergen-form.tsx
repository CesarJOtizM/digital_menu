import Link from "next/link";
import { getTranslations } from "@/i18n/server";
import { resolveAdminError, type TranslationParams } from "@/i18n";
import { adminActionCancelClass } from "../../_components/admin-action-styles";
import { FormSubmitButton } from "../../_components/form-submit-button";
import { saveAllergenAction } from "../allergen-actions";
import { AllergenEmojiPicker } from "./allergen-emoji-picker";
import {
  ContentLocaleField,
  ContentLocaleTabs,
} from "./content-locale-tabs";

interface AllergenFormProps {
  allergenId?: string;
  initialName?: string;
  initialNameEn?: string;
  initialIcon?: string;
  title: string;
  error?: string;
  errorParams?: TranslationParams;
}

export async function AllergenForm({
  allergenId,
  initialName = "",
  initialNameEn = "",
  initialIcon = "",
  title,
  error,
  errorParams,
}: AllergenFormProps) {
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
        action={saveAllergenAction}
        className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5"
      >
        {allergenId ? (
          <input type="hidden" name="allergenId" value={allergenId} />
        ) : null}
        <input type="hidden" name="returnTo" value="/dashboard/menu/allergens" />

        <ContentLocaleTabs
          esPanel={
            <ContentLocaleField
              id="name"
              label={t("allergens.name")}
              name="name"
              defaultValue={initialName}
              required
            />
          }
          enPanel={
            <ContentLocaleField
              id="nameEn"
              label={t("allergens.name")}
              name="nameEn"
              defaultValue={initialNameEn}
              hint={t("contentLocale.optionalHint")}
            />
          }
        />

        <div className="space-y-2">
          <p className="text-sm font-medium">
            {t("allergens.emoji")}{" "}
            <span className="font-normal text-neutral-500">
              ({t("allergens.emojiOptional")})
            </span>
          </p>
          <AllergenEmojiPicker initialIcon={initialIcon} />
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <FormSubmitButton variant="primary">
            {t("allergens.save")}
          </FormSubmitButton>
          <Link
            href="/dashboard/menu/allergens"
            className={adminActionCancelClass}
          >
            {t("common.cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
