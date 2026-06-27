import { describe, expect, it } from "vitest";
import {
  formatCentavosForInput,
  parsePriceInputToCentavos,
} from "./parse-price-input";

describe("parsePriceInputToCentavos", () => {
  it("parses decimal strings into centavos", () => {
    expect(parsePriceInputToCentavos("12.50")).toBe(1250);
    expect(parsePriceInputToCentavos("12,50")).toBe(1250);
  });

  it("rejects invalid prices", () => {
    expect(() => parsePriceInputToCentavos("")).toThrow("Precio requerido");
    expect(() => parsePriceInputToCentavos("-1")).toThrow("Precio inválido");
  });
});

describe("formatCentavosForInput", () => {
  it("formats centavos with two decimals", () => {
    expect(formatCentavosForInput(1250)).toBe("12.50");
  });
});
