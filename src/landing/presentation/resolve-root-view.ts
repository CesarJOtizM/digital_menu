/** The view the root route `/` should render. */
export type RootView = "landing" | "menu";

/** Minimal config slice the root decision needs (no I/O). */
export interface RootViewConfig {
  /** When true, the root renders the landing page; otherwise the menu. */
  readonly landingEnabled?: boolean;
}

/**
 * Decides what the root route `/` renders (Option A):
 * - `landingEnabled === true`  → `"landing"`
 * - otherwise (false/undefined) → `"menu"`
 *
 * Pure and total: every input maps to exactly one view, so the root page can
 * render landing-or-menu with no redirect hop. The menu is also always served
 * at `/menu` regardless of this decision.
 */
export function resolveRootView(config: RootViewConfig): RootView {
  return config.landingEnabled === true ? "landing" : "menu";
}
