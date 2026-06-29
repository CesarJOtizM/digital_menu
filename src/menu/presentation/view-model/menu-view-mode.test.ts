import { describe, expect, it } from "vitest";
import {
  MENU_VIEW_MODES,
  isMenuViewMode,
  normalizeMenuViewMode,
  type MenuViewMode,
} from "./menu-view-mode";

describe("menu view mode", () => {
  it("exposes the two supported modes with 'list' as the brand default", () => {
    expect(MENU_VIEW_MODES).toEqual(["list", "cards"]);
    const fallback: MenuViewMode = normalizeMenuViewMode(null);
    expect(fallback).toBe("list");
  });

  it("recognizes only the supported mode strings", () => {
    expect(isMenuViewMode("list")).toBe(true);
    expect(isMenuViewMode("cards")).toBe(true);
    expect(isMenuViewMode("grid")).toBe(false);
    expect(isMenuViewMode("")).toBe(false);
    expect(isMenuViewMode(undefined)).toBe(false);
  });

  it("normalizes a stored 'cards' preference to 'cards'", () => {
    expect(normalizeMenuViewMode("cards")).toBe("cards");
  });

  it("falls back to 'list' for any unrecognized stored value", () => {
    expect(normalizeMenuViewMode("grid")).toBe("list");
    expect(normalizeMenuViewMode("CARDS")).toBe("list");
    expect(normalizeMenuViewMode(undefined)).toBe("list");
  });
});
