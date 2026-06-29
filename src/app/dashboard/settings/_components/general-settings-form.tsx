import { getTranslations } from "@/i18n/server";
import { FormSubmitButton } from "../../_components/form-submit-button";
import { updateGeneralSettingsAction } from "../actions";
import type { DashboardSettingsView } from "../load-settings";
import {
  SETTINGS_CURRENCIES,
  SETTINGS_LANGUAGES,
  SETTINGS_MENU_VIEW_MODES,
} from "../settings-options";

interface GeneralSettingsFormProps {
  settings: DashboardSettingsView;
}

export async function GeneralSettingsForm({ settings }: GeneralSettingsFormProps) {
  const { t } = await getTranslations();

  return (
    <form
      action={updateGeneralSettingsAction}
      className="space-y-5 rounded-lg border border-neutral-200 bg-white p-5"
    >
      <div>
        <label htmlFor="currency" className="text-sm font-medium">
          {t("dashboard.settings.currency")}
        </label>
        <p className="mt-1 text-sm text-neutral-600">
          {t("dashboard.settings.currencyHint")}
        </p>
        <select
          id="currency"
          name="currency"
          defaultValue={settings.currency}
          className="mt-2 w-full max-w-xs rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          {SETTINGS_CURRENCIES.map((currency) => (
            <option key={currency} value={currency}>
              {currency}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="language" className="text-sm font-medium">
          {t("dashboard.settings.language")}
        </label>
        <p className="mt-1 text-sm text-neutral-600">
          {t("dashboard.settings.languageHint")}
        </p>
        <select
          id="language"
          name="language"
          defaultValue={settings.language}
          className="mt-2 w-full max-w-xs rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm"
        >
          {SETTINGS_LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {language === "es"
                ? t("dashboard.settings.languageEs")
                : t("dashboard.settings.languageEn")}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="showCurrencySymbol"
          defaultChecked={settings.showCurrencySymbol}
          className="mt-1 h-4 w-4 rounded border-neutral-300"
        />
        <span>
          <span className="font-medium">{t("dashboard.settings.showCurrencySymbol")}</span>
          <span className="mt-1 block text-neutral-600">
            {t("dashboard.settings.showCurrencySymbolHint")}
          </span>
        </span>
      </label>

      <fieldset>
        <legend className="text-sm font-medium">
          {t("dashboard.settings.defaultMenuView")}
        </legend>
        <p className="mt-1 text-sm text-neutral-600">
          {t("dashboard.settings.defaultMenuViewHint")}
        </p>
        <div className="mt-3 flex flex-wrap gap-4">
          {SETTINGS_MENU_VIEW_MODES.map((mode) => (
            <label key={mode} className="inline-flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="defaultMenuViewMode"
                value={mode}
                defaultChecked={settings.defaultMenuViewMode === mode}
                className="h-4 w-4 border-neutral-300"
              />
              {mode === "list"
                ? t("dashboard.settings.menuViewList")
                : t("dashboard.settings.menuViewCards")}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="pt-2">
        <FormSubmitButton variant="primary">
          {t("dashboard.settings.saveGeneral")}
        </FormSubmitButton>
      </div>
    </form>
  );
}
