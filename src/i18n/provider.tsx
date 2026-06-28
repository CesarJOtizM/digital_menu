"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { UiLocale } from "./config";
import {
  createTranslator,
  type Messages,
  type TranslationParams,
  type Translator,
} from "./translate";

interface I18nContextValue {
  readonly locale: UiLocale;
  readonly t: Translator;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export interface I18nProviderProps {
  readonly locale: UiLocale;
  readonly messages: Messages;
  readonly children: ReactNode;
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  const value = useMemo(
    () => ({ locale, t: createTranslator(messages) }),
    [locale, messages],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslations(): Translator {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslations must be used within I18nProvider");
  }
  return context.t;
}

export function useUiLocale(): UiLocale {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useUiLocale must be used within I18nProvider");
  }
  return context.locale;
}

export type { TranslationParams, Translator };
