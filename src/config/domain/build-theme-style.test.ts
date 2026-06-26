import { describe, it, expect } from "vitest";
import { buildThemeStyle } from "./build-theme-style";

/**
 * buildThemeStyle maps deploy branding colors to CSS custom properties consumed
 * by the menu layout (globals.css drives every accent-derived surface from
 * `--color-accent`). It returns a React-style object so the layout can spread it
 * onto a wrapper `style` prop — no `var()` in className (tailwind-4 rule).
 */
describe("buildThemeStyle", () => {
  it("maps the primary color to the --color-accent custom property", () => {
    const style = buildThemeStyle({ primaryColor: "#0f766e" });
    expect(style["--color-accent"]).toBe("#0f766e");
  });

  it("maps a provided secondary color to --color-secondary", () => {
    const style = buildThemeStyle({
      primaryColor: "#0f766e",
      secondaryColor: "#f59e0b",
    });
    expect(style["--color-secondary"]).toBe("#f59e0b");
  });

  it("falls back --color-secondary to the primary color when none is given", () => {
    const style = buildThemeStyle({ primaryColor: "#0f766e" });
    expect(style["--color-secondary"]).toBe("#0f766e");
  });

  it("treats an explicitly null secondary color as absent (falls back to primary)", () => {
    const style = buildThemeStyle({
      primaryColor: "#123456",
      secondaryColor: null,
    });
    expect(style["--color-secondary"]).toBe("#123456");
  });

  it("returns only the accent + secondary custom properties (no leakage)", () => {
    const style = buildThemeStyle({
      primaryColor: "#0f766e",
      secondaryColor: "#f59e0b",
    });
    expect(Object.keys(style).sort()).toEqual([
      "--color-accent",
      "--color-secondary",
    ]);
  });
});
