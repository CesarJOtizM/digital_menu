import { describe, it, expect } from "vitest";
import { formatPrice } from "./format-price";

/**
 * formatPrice converts an integer centavos amount into a display string driven
 * entirely by deploy config (locale, currency, symbol on/off). Money is ALWAYS
 * integer centavos in; only the rendered string differs. No float math on input.
 */
describe("formatPrice", () => {
  describe("symbol ON", () => {
    it("renders a currency symbol for USD en-US (e.g. $24.50)", () => {
      const out = formatPrice(2450, {
        locale: "en-US",
        currency: "USD",
        showSymbol: true,
      });
      expect(out).toBe("$24.50");
    });

    it("renders the locale currency format for es-AR ARS", () => {
      const out = formatPrice(2450, {
        locale: "es-AR",
        currency: "ARS",
        showSymbol: true,
      });
      // es-AR uses comma decimal + the ARS symbol "$".
      expect(out).toBe("$\u00a024,50");
    });
  });

  describe("symbol OFF (Azahar-style bare numbers)", () => {
    it("renders a bare number with no currency symbol for en-US", () => {
      const out = formatPrice(2450, {
        locale: "en-US",
        currency: "USD",
        showSymbol: false,
      });
      expect(out).toBe("24.50");
    });

    it("uses the locale decimal separator (comma) for es-AR with no symbol", () => {
      const out = formatPrice(2450, {
        locale: "es-AR",
        currency: "ARS",
        showSymbol: false,
      });
      expect(out).toBe("24,50");
    });

    it("applies locale grouping separators to large bare amounts (en-US)", () => {
      // 1_234_567 centavos => 12,345.67
      const out = formatPrice(1234567, {
        locale: "en-US",
        currency: "USD",
        showSymbol: false,
      });
      expect(out).toBe("12,345.67");
    });

    it("applies es-AR grouping (dot thousands, comma decimal) with no symbol", () => {
      const out = formatPrice(1234567, {
        locale: "es-AR",
        currency: "ARS",
        showSymbol: false,
      });
      expect(out).toBe("12.345,67");
    });
  });

  describe("edge amounts", () => {
    it("formats zero centavos", () => {
      expect(
        formatPrice(0, { locale: "en-US", currency: "USD", showSymbol: false }),
      ).toBe("0.00");
      expect(
        formatPrice(0, { locale: "en-US", currency: "USD", showSymbol: true }),
      ).toBe("$0.00");
    });

    it("formats large amounts with symbol and grouping (en-US)", () => {
      expect(
        formatPrice(1234567, {
          locale: "en-US",
          currency: "USD",
          showSymbol: true,
        }),
      ).toBe("$12,345.67");
    });
  });

  describe("zero-decimal currencies", () => {
    it("treats minor units as whole units when decimalDigits=0 (e.g. JPY)", () => {
      // With 0 decimal digits the stored integer IS the whole-unit amount.
      const out = formatPrice(4500, {
        locale: "ja-JP",
        currency: "JPY",
        showSymbol: false,
        decimalDigits: 0,
      });
      expect(out).toBe("4,500");
    });
  });
});
