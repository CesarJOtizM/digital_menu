import type { CSSProperties } from "react";

/**
 * Branding subset that drives theming. Colors are deploy-configured (Settings
 * singleton) — there is no hardcoded brand palette in the domain.
 */
export interface ThemeBranding {
  readonly primaryColor: string;
  readonly secondaryColor?: string | null;
}

/**
 * The CSS custom properties the menu layout exposes. `globals.css` derives every
 * accent-tinted surface (cards, pills, header, footer) from `--color-accent`
 * via `color-mix`, so setting these two variables re-themes the whole menu.
 */
export type ThemeStyle = CSSProperties & {
  "--color-accent": string;
  "--color-secondary": string;
};

/**
 * Builds the theme custom-property object from deploy branding. Pure: same
 * branding always yields the same style object. Spread onto a layout wrapper's
 * `style` prop (never referenced via `var()` in className — tailwind-4 rule).
 *
 * `--color-secondary` falls back to the primary color when no secondary is set,
 * so the theme is always fully defined.
 */
export function buildThemeStyle(branding: ThemeBranding): ThemeStyle {
  const accent = branding.primaryColor;
  const secondary = branding.secondaryColor ?? accent;

  return {
    "--color-accent": accent,
    "--color-secondary": secondary,
  };
}
