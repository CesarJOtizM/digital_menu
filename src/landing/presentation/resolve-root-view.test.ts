import { describe, expect, it } from "vitest";
import { resolveRootView } from "./resolve-root-view";

/**
 * Pure root-route decision (Option A): the root `/` renders the LANDING when the
 * deploy enables it, otherwise it renders the MENU. The menu is ALSO always
 * reachable at `/menu`. This function holds the WHOLE decision so it can be unit
 * tested without Next routing — no redirect, no I/O.
 */
describe("resolveRootView", () => {
  it("renders the landing when landing is enabled", () => {
    expect(resolveRootView({ landingEnabled: true })).toBe("landing");
  });

  it("renders the menu when landing is explicitly disabled", () => {
    expect(resolveRootView({ landingEnabled: false })).toBe("menu");
  });

  it("renders the menu when landingEnabled is undefined (safe default)", () => {
    expect(resolveRootView({})).toBe("menu");
  });
});
