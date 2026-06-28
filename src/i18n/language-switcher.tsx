"use client";

import { useTransition } from "react";
import { setUiLocaleAction } from "./actions";
import { locales, type UiLocale } from "./config";
import { useTranslations, useUiLocale } from "./provider";
import { cn } from "@/lib/cn";

const LOCALE_LABELS: Record<UiLocale, string> = {
  es: "ES",
  en: "EN",
};

export interface LanguageSwitcherProps {
  readonly className?: string;
  readonly variant?: "default" | "onDark";
}

export function LanguageSwitcher({
  className,
  variant = "default",
}: LanguageSwitcherProps) {
  const t = useTranslations();
  const currentLocale = useUiLocale();
  const [pending, startTransition] = useTransition();

  function selectLocale(locale: UiLocale) {
    if (locale === currentLocale || pending) {
      return;
    }

    startTransition(async () => {
      await setUiLocaleAction(locale);
    });
  }

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role="group"
      aria-label={t("common.language")}
    >
      {locales.map((locale) => {
        const active = locale === currentLocale;

        return (
          <button
            key={locale}
            type="button"
            disabled={pending}
            aria-pressed={active}
            aria-label={locale === "es" ? t("common.languageEs") : t("common.languageEn")}
            onClick={() => selectLocale(locale)}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide transition-colors",
              variant === "default" &&
                (active
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"),
              variant === "onDark" &&
                (active
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"),
              pending && "opacity-60",
            )}
          >
            {LOCALE_LABELS[locale]}
          </button>
        );
      })}
    </div>
  );
}
