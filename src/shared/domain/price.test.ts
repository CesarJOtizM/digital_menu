import { describe, it, expect } from "vitest";
import { Price } from "./price";
import { InvalidPrice } from "./errors";

describe("Price", () => {
  describe("create", () => {
    it("accepts a non-negative integer amount of centavos", () => {
      const price = Price.create(1500);
      expect(price.value).toBe(1500);
    });

    it("accepts zero centavos", () => {
      const price = Price.create(0);
      expect(price.value).toBe(0);
    });

    it("rejects a negative amount", () => {
      expect(() => Price.create(-1)).toThrow(InvalidPrice);
    });

    it("rejects a floating-point amount (money must be integer centavos)", () => {
      expect(() => Price.create(15.5)).toThrow(InvalidPrice);
    });
  });

  describe("add", () => {
    it("sums two prices in integer centavos", () => {
      const result = Price.create(2000).add(Price.create(450));
      expect(result.value).toBe(2450);
    });

    it("is pure integer arithmetic with no floating point drift", () => {
      const result = Price.create(1500)
        .add(Price.create(300))
        .add(Price.create(150));
      expect(result.value).toBe(1950);
      expect(Number.isInteger(result.value)).toBe(true);
    });
  });

  describe("toDisplay", () => {
    it("delegates formatting to the injected formatter (no hardcoded locale/currency)", () => {
      const price = Price.create(2450);
      const formatted = price.toDisplay((centavos) => `formatted:${centavos}`);
      expect(formatted).toBe("formatted:2450");
    });

    it("passes the raw centavos value to the formatter", () => {
      const price = Price.create(999);
      const received: number[] = [];
      price.toDisplay((centavos) => {
        received.push(centavos);
        return "";
      });
      expect(received).toEqual([999]);
    });
  });

  describe("equals", () => {
    it("is true for the same centavos value", () => {
      expect(Price.create(1500).equals(Price.create(1500))).toBe(true);
    });

    it("is false for a different centavos value", () => {
      expect(Price.create(1500).equals(Price.create(1501))).toBe(false);
    });
  });
});
