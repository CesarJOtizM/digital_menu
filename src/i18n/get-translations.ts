import { getUiLocale } from "./get-locale";
import { getMessages, createTranslator, type Translator } from "./translate";
import type { UiLocale } from "./config";
import type { Messages } from "./translate";

export interface I18nBundle {
  readonly locale: UiLocale;
  readonly messages: Messages;
  readonly t: Translator;
}

export async function getTranslations(): Promise<I18nBundle> {
  const locale = await getUiLocale();
  const messages = getMessages(locale);
  const t = createTranslator(messages);

  return { locale, messages, t };
}
