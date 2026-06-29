import { describe, expect, it } from "vitest";
import {
  normalizeOptionalTranslation,
  resolveLocalizedText,
} from "./resolve-localized-text";

describe("resolveLocalizedText", () => {
  it("returns English when locale is en and translation exists", () => {
    expect(resolveLocalizedText("Croquetas", "Croquettes", "en")).toBe("Croquettes");
  });

  it("falls back to default when English is missing", () => {
    expect(resolveLocalizedText("Croquetas", null, "en")).toBe("Croquetas");
    expect(resolveLocalizedText("Croquetas", "   ", "en")).toBe("Croquetas");
  });

  it("keeps default for Spanish locale even when English exists", () => {
    expect(resolveLocalizedText("Croquetas", "Croquettes", "es")).toBe("Croquetas");
  });
});

describe("normalizeOptionalTranslation", () => {
  it("trims and nulls empty values", () => {
    expect(normalizeOptionalTranslation("  Hola  ")).toBe("Hola");
    expect(normalizeOptionalTranslation("")).toBeNull();
    expect(normalizeOptionalTranslation("   ")).toBeNull();
  });
});
