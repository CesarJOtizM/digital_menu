import type { UiLocale } from "@/i18n/config";
import { resolveLocalizedText } from "@/i18n/resolve-localized-text";

type NamedContent = {
  readonly name: string;
  readonly nameEn?: string | null;
};

type DescribedContent = NamedContent & {
  readonly description: string;
  readonly descriptionEn?: string | null;
};

type LabeledContent = {
  readonly label: string;
  readonly labelEn?: string | null;
};

export function localizedName(content: NamedContent, locale: UiLocale): string {
  return resolveLocalizedText(content.name, content.nameEn, locale);
}

export function localizedDescription(
  content: DescribedContent,
  locale: UiLocale,
): string {
  return resolveLocalizedText(content.description, content.descriptionEn, locale);
}

export function localizedLabel(content: LabeledContent, locale: UiLocale): string {
  return resolveLocalizedText(content.label, content.labelEn, locale);
}
