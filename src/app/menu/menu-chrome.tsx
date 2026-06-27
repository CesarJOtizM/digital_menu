import type { ReactNode } from "react";
import { buildThemeStyle } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";

/**
 * The Azahar-style menu chrome: a themed cream surface wrapper plus the dark
 * accent footer. Shared by the `/menu` layout and by the root `/` when the
 * landing is disabled, so the menu looks identical at both paths. The theme
 * (`buildThemeStyle`) derives from the deploy's brand color. Single-tenant.
 */
export async function MenuChrome({
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
