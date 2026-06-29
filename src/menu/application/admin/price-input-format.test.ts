import { describe, expect, it } from "vitest";
import {
  formatPriceInputMask,
  formatPriceInputMaskWhileTyping,
  getCurrencySymbol,
  normalizeMaskedPriceInput,
  resolvePriceInputSeparators,
} from "./price-input-format";

describe("resolvePriceInputSeparators", () => {
  it("uses dot thousands and comma decimals for Spanish locales", () => {
    expect(resolvePriceInputSeparators("es-PR")).toEqual({
      group: ".",
      decimal: ",",
    });
  });

  it("uses comma thousands and dot decimals for English locales", () => {
    expect(resolvePriceInputSeparators("en-US")).toEqual({
      group: ",",
      decimal: ".",
    });
  });
});

describe("formatPriceInputMask", () => {
  it("formats USD with dot thousands in Spanish locale", () => {
    expect(
      formatPriceInputMask(12_345_656, { locale: "es-PR", currency: "USD" }),
    ).toBe("$123.456,56");
  });

  it("formats USD with comma thousands in English locale", () => {
    expect(
      formatPriceInputMask(12_345_656, { locale: "en-US", currency: "USD" }),
    ).toBe("$123,456.56");
  });
});

describe("normalizeMaskedPriceInput", () => {
  it("parses Spanish-style masked values", () => {
    expect(normalizeMaskedPriceInput("$1.234,56")).toBe("1234.56");
  });

  it("parses English-style masked values", () => {
    expect(normalizeMaskedPriceInput("$1,234.56")).toBe("1234.56");
  });

  it("parses plain decimal strings", () => {
    expect(normalizeMaskedPriceInput("12.50")).toBe("12.50");
  });
});

describe("getCurrencySymbol", () => {
  it("returns a narrow symbol for USD", () => {
    expect(getCurrencySymbol("USD", "en-US")).toBe("$");
  });
});

describe("formatPriceInputMaskWhileTyping", () => {
  it("formats digits as centavos while typing in Spanish locale", () => {
    expect(
      formatPriceInputMaskWhileTyping("1250", { locale: "es-PR", currency: "USD" }),
    ).toBe("$12,50");
    expect(
      formatPriceInputMaskWhileTyping("123456", { locale: "es-PR", currency: "USD" }),
    ).toBe("$1.234,56");
  });

  it("formats digits as centavos while typing in English locale", () => {
    expect(
      formatPriceInputMaskWhileTyping("1250", { locale: "en-US", currency: "USD" }),
    ).toBe("$12.50");
  });

  it("returns empty string when there are no digits", () => {
    expect(
      formatPriceInputMaskWhileTyping("$", { locale: "en-US", currency: "USD" }),
    ).toBe("");
  });
});
