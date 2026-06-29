import type { UiLocale } from "./config";

export function normalizeOptionalTranslation(
  value: string | undefined | null,
): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

/** Picks the English override when locale is `en`, otherwise the default value. */
export function resolveLocalizedText(
  defaultValue: string,
  englishValue: string | null | undefined,
  locale: UiLocale,
): string {
  if (locale === "en") {
    const english = englishValue?.trim();
    if (english) {
      return english;
    }
  }

  return defaultValue;
}
