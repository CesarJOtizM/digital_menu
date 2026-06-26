import type { ReactNode } from "react";
import { buildThemeStyle } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";

/**
 * Layout for the public menu route group. Applies the config-driven theme
 * (`buildThemeStyle`) to the menu wrapper so the menu surface, accents and
 * footer all derive from the deploy's brand color, and renders the dark
 * Azahar-style footer with simple nav. Single-tenant: one deploy, one config.
 */
export default async function MenuLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const config = await getConfig();
  const themeStyle = buildThemeStyle({
    primaryColor: config.primaryColor,
    secondaryColor: config.secondaryColor,
  });

  return (
    <div className="menu-surface flex min-h-screen flex-col" style={themeStyle}>
      <div className="flex-1">{children}</div>

      <footer className="menu-accent-bg mt-auto px-6 py-10 text-white/90">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 text-center">
          <p className="font-heading text-xl font-medium tracking-wide">
            {config.restaurantName}
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">
            Digital Menu
          </p>
        </div>
      </footer>
    </div>
  );
}
