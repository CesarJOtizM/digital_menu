import { describe, it, expect } from "vitest";
import { Price } from "@/shared/domain";
import { createPriceFormatter } from "./create-price-formatter";

/**
 * createPriceFormatter binds deploy config into the shared Price.toDisplay
 * injectable formatter, so the domain stays config-agnostic while presentation
 * gets correct locale/currency/symbol rendering.
 */
describe("createPriceFormatter", () => {
  it("produces a PriceFormatter Price.toDisplay can consume (symbol ON)", () => {
    const format = createPriceFormatter({
      locale: "en-US",
      currency: "USD",
      showSymbol: true,
    });
    const display = Price.create(2450).toDisplay(format);
    expect(display).toBe("$24.50");
  });

  it("produces bare-number output when symbol display is OFF", () => {
    const format = createPriceFormatter({
      locale: "en-US",
      currency: "USD",
      showSymbol: false,
    });
    const display = Price.create(2450).toDisplay(format);
    expect(display).toBe("24.50");
  });

  it("honors the configured locale separators (es-AR, no symbol)", () => {
    const format = createPriceFormatter({
      locale: "es-AR",
      currency: "ARS",
      showSymbol: false,
    });
    expect(Price.create(1234567).toDisplay(format)).toBe("12.345,67");
  });
});
