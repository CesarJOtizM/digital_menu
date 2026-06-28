import type { ReactNode } from "react";
import { buildThemeStyle } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { getTranslations } from "@/i18n/server";
import { LanguageSwitcher } from "@/i18n";

export async function MenuChrome({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [config, { t }] = await Promise.all([getConfig(), getTranslations()]);
  const themeStyle = buildThemeStyle({
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
  });

  return (
    <div className="menu-surface flex min-h-screen flex-col" style={themeStyle}>
      <div className="relative flex-1">
        <div className="absolute right-4 top-4 z-10">
          <LanguageSwitcher />
        </div>
        {children}
      </div>

      <footer className="menu-accent-bg mt-auto px-6 py-10 text-white/90">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center">
          <p className="font-heading text-xl font-medium tracking-wide">
            {config.restaurantName}
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">
            {t("menu.digitalMenu")}
          </p>
        </div>
      </footer>
    </div>
  );
}
