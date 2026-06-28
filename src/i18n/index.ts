export {
  UI_LOCALE_COOKIE,
  defaultLocale,
  isUiLocale,
  locales,
  uiLocaleFromDeployLocale,
  type UiLocale,
} from "./config";
export { I18nProvider, useTranslations, useUiLocale } from "./provider";
export { LanguageSwitcher } from "./language-switcher";
export { setUiLocaleAction } from "./actions";
export { extractAdminErrorParams } from "./extract-admin-error-params";
export {
  createTranslator,
  getMessages,
  pluralize,
  resolveAdminError,
  resolveLoginError,
  type Messages,
  type Translator,
  type TranslationParams,
} from "./translate";
