export const UI_LOCALE_COOKIE = "ui-locale";

export const locales = ["es", "en"] as const;

export type UiLocale = (typeof locales)[number];

export const defaultLocale: UiLocale = "es";

export function isUiLocale(value: string): value is UiLocale {
  return (locales as readonly string[]).includes(value);
}

/** Maps a BCP 47 deploy locale (e.g. es-PR, en-US) to a UI locale. */
export function uiLocaleFromDeployLocale(deployLocale: string): UiLocale {
  const language = deployLocale.split("-")[0]?.toLowerCase();
  return language === "en" ? "en" : "es";
}
