import type { UiLocale } from "@/i18n/config";
import { uiLocaleFromDeployLocale } from "@/i18n/config";
import type { MenuViewMode } from "@/menu/presentation/view-model/menu-view-mode";

export const SETTINGS_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "MXN",
  "ARS",
  "COP",
  "PEN",
  "CLP",
  "CRC",
  "DOP",
] as const;

export type SettingsCurrency = (typeof SETTINGS_CURRENCIES)[number];

export const SETTINGS_LANGUAGES = ["es", "en"] as const;

export type SettingsLanguage = UiLocale;

export const SETTINGS_MENU_VIEW_MODES: readonly MenuViewMode[] = ["list", "cards"];

export function isSettingsCurrency(value: string): value is SettingsCurrency {
  return (SETTINGS_CURRENCIES as readonly string[]).includes(value);
}

export function isSettingsLanguage(value: string): value is SettingsLanguage {
  return (SETTINGS_LANGUAGES as readonly string[]).includes(value);
}

export function languageToDeployLocale(language: SettingsLanguage): string {
  return language === "en" ? "en-US" : "es-PR";
}

export function deployLocaleToLanguage(locale: string): SettingsLanguage {
  return uiLocaleFromDeployLocale(locale);
}
