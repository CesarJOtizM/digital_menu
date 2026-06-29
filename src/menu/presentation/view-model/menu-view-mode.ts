/**
 * The two user-facing layouts for the public menu:
 * - `list`: the editorial Azahar-style row layout (the brand default).
 * - `cards`: an image-forward responsive card grid.
 *
 * `list` is first so it remains the SSR/default render, preserving the current
 * look and avoiding any hydration mismatch before a stored preference is read.
 */
export const MENU_VIEW_MODES = ["list", "cards"] as const;

export type MenuViewMode = (typeof MENU_VIEW_MODES)[number];

/** The brand default applied on first render and for unknown stored values. */
export const DEFAULT_MENU_VIEW_MODE: MenuViewMode = "list";

/** Type guard: true only for the exact supported mode strings. */
export function isMenuViewMode(value: unknown): value is MenuViewMode {
  return (
    typeof value === "string" &&
    (MENU_VIEW_MODES as readonly string[]).includes(value)
  );
}

/**
 * Coerce an arbitrary (possibly persisted) value into a valid mode, falling back
 * to the brand default. Pure — used by the client switcher when hydrating from
 * localStorage without risking a bad value reaching the render.
 */
export function normalizeMenuViewMode(
  value: unknown,
  fallback: MenuViewMode = DEFAULT_MENU_VIEW_MODE,
): MenuViewMode {
  return isMenuViewMode(value) ? value : fallback;
}
