import type { UiLocale } from "./config";
import en from "./messages/en.json";
import es from "./messages/es.json";

export type Messages = typeof es;

const catalogs: Record<UiLocale, Messages> = { es, en };

export function getMessages(locale: UiLocale): Messages {
  return catalogs[locale];
}

export type TranslationParams = Record<string, string | number>;

function resolvePath(messages: Messages, key: string): unknown {
  return key.split(".").reduce<unknown>((current, part) => {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }
    return (current as Record<string, unknown>)[part];
  }, messages);
}

function interpolate(
  template: string,
  params?: TranslationParams,
): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params[name];
    return value === undefined ? `{${name}}` : String(value);
  });
}

export type Translator = (key: string, params?: TranslationParams) => string;

export function createTranslator(messages: Messages): Translator {
  return function translate(key: string, params?: TranslationParams): string {
    const value = resolvePath(messages, key);
    if (typeof value !== "string") {
      return key;
    }
    return interpolate(value, params);
  };
}

/** Interpolate `{param}` placeholders in a label template (safe for RSC → client props). */
export function formatLabel(
  template: string,
  params: TranslationParams,
): string {
  return interpolate(template, params);
}

/** Plural helper for simple one/other pairs used in the dashboard. */
export function pluralize(
  count: number,
  one: string,
  other: string,
): string {
  return count === 1 ? one : other;
}

export function resolveAdminError(
  t: Translator,
  code: string | undefined,
  params?: TranslationParams,
): string | null {
  if (!code) {
    return null;
  }

  const message = t(`admin.errors.${code}`, params);
  if (message !== `admin.errors.${code}`) {
    return message;
  }

  return t("admin.errors.generic");
}

export function resolveLoginError(
  t: Translator,
  code: string | undefined,
): string | null {
  if (!code) {
    return null;
  }

  const message = t(`login.errors.${code}`);
  if (message !== `login.errors.${code}`) {
    return message;
  }

  return t("login.errors.generic");
}
