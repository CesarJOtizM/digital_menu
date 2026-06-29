"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/cn";
import type { UiLocale } from "@/i18n/config";

export interface ContentLocaleTabsProps {
  readonly esPanel: ReactNode;
  readonly enPanel: ReactNode;
  readonly className?: string;
  readonly onLocaleChange?: (locale: UiLocale) => void;
}

export function ContentLocaleTabs({
  esPanel,
  enPanel,
  className,
  onLocaleChange,
}: ContentLocaleTabsProps) {
  const t = useTranslations();
  const [locale, setLocale] = useState<UiLocale>("es");

  function selectLocale(next: UiLocale) {
    setLocale(next);
    onLocaleChange?.(next);
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1"
        role="tablist"
        aria-label={t("contentLocale.tabsAria")}
      >
        {(["es", "en"] as const).map((tabLocale) => {
          const active = locale === tabLocale;

          return (
            <button
              key={tabLocale}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectLocale(tabLocale)}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-600 hover:text-neutral-900",
              )}
            >
              {tabLocale === "es" ? t("contentLocale.spanish") : t("contentLocale.english")}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        <div role="tabpanel" hidden={locale !== "es"}>
          {esPanel}
        </div>
        <div role="tabpanel" hidden={locale !== "en"}>
          {enPanel}
        </div>
      </div>
    </div>
  );
}

export function ContentLocaleField({
  id,
  label,
  name,
  defaultValue = "",
  required = false,
  multiline = false,
  hint,
}: {
  readonly id: string;
  readonly label: string;
  readonly name: string;
  readonly defaultValue?: string;
  readonly required?: boolean;
  readonly multiline?: boolean;
  readonly hint?: string;
}) {
  const inputClassName =
    "w-full rounded-md border border-neutral-300 px-3 py-2 text-sm";

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? null : (
          <span className="font-normal text-neutral-500"> ({hint})</span>
        )}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={4}
          required={required}
          defaultValue={defaultValue}
          className={inputClassName}
        />
      ) : (
        <input
          id={id}
          name={name}
          required={required}
          defaultValue={defaultValue}
          className={inputClassName}
        />
      )}
    </div>
  );
}

export function ContentLocaleSwitcher({
  value,
  onChange,
  className,
}: {
  readonly value: UiLocale;
  readonly onChange: (locale: UiLocale) => void;
  readonly className?: string;
}) {
  const t = useTranslations();

  return (
    <div
      className={cn(
        "inline-flex rounded-lg border border-neutral-200 bg-neutral-50 p-1",
        className,
      )}
      role="tablist"
      aria-label={t("contentLocale.tabsAria")}
    >
      {(["es", "en"] as const).map((tabLocale) => {
        const active = value === tabLocale;

        return (
          <button
            key={tabLocale}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tabLocale)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-white text-neutral-900 shadow-sm"
                : "text-neutral-600 hover:text-neutral-900",
            )}
          >
            {tabLocale === "es" ? t("contentLocale.spanish") : t("contentLocale.english")}
          </button>
        );
      })}
    </div>
  );
}
