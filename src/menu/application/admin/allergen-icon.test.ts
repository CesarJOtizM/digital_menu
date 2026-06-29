import { describe, expect, it } from "vitest";
import {
  normalizeAllergenIconForSave,
  resolveAllergenDisplayIcon,
} from "./allergen-icon";

describe("resolveAllergenDisplayIcon", () => {
  it("maps legacy slug icons to emoji", () => {
    expect(resolveAllergenDisplayIcon("milk")).toBe("🥛");
    expect(resolveAllergenDisplayIcon("wheat")).toBe("🌾");
  });

  it("returns emoji values unchanged", () => {
    expect(resolveAllergenDisplayIcon("🥜")).toBe("🥜");
  });

  it("returns null when icon is missing", () => {
    expect(resolveAllergenDisplayIcon(null)).toBeNull();
    expect(resolveAllergenDisplayIcon("")).toBeNull();
  });
});

describe("normalizeAllergenIconForSave", () => {
  it("stores null when empty", () => {
    expect(normalizeAllergenIconForSave("")).toBeNull();
    expect(normalizeAllergenIconForSave(null)).toBeNull();
  });

  it("normalizes legacy slugs to emoji", () => {
    expect(normalizeAllergenIconForSave("milk")).toBe("🥛");
  });
});
