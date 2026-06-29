import { describe, expect, it } from "vitest";
import { MenuAdminError } from "./menu-admin-service";
import {
  formatCentavosForInput,
  parsePriceInputToCentavos,
} from "./parse-price-input";

describe("parsePriceInputToCentavos", () => {
  it("parses decimal strings with dot or comma", () => {
    expect(parsePriceInputToCentavos("12.50")).toBe(1250);
    expect(parsePriceInputToCentavos("12,50")).toBe(1250);
  });

  it("parses locale-masked currency strings", () => {
    expect(parsePriceInputToCentavos("$1.234,56")).toBe(123456);
    expect(parsePriceInputToCentavos("$1,234.56")).toBe(123456);
  });

  it("rejects empty and invalid values", () => {
    expect(() => parsePriceInputToCentavos("")).toThrow(MenuAdminError);
    expect(() => parsePriceInputToCentavos("-1")).toThrow(MenuAdminError);
    expect(() => parsePriceInputToCentavos("")).toThrow(
      expect.objectContaining({ code: "PRICE_REQUIRED" }),
    );
    expect(() => parsePriceInputToCentavos("-1")).toThrow(
      expect.objectContaining({ code: "PRICE_INVALID" }),
    );
  });
});

describe("formatCentavosForInput", () => {
  it("formats centavos as a fixed two-decimal string", () => {
    expect(formatCentavosForInput(1250)).toBe("12.50");
  });
});
