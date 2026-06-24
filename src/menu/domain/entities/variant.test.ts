import { describe, it, expect } from "vitest";
import { Variant } from "./variant";
import { Price } from "@/shared/domain";

describe("Variant", () => {
  it("holds an absolute price in integer centavos", () => {
    const variant = Variant.create({
      id: "var-1",
      label: "Large",
      price: Price.create(2000),
      position: 0,
    });
    expect(variant.id).toBe("var-1");
    expect(variant.label).toBe("Large");
    expect(variant.price.value).toBe(2000);
    expect(variant.position).toBe(0);
  });

  it("exposes a different absolute price for a different variant", () => {
    const small = Variant.create({
      id: "var-2",
      label: "Small",
      price: Price.create(1200),
      position: 1,
    });
    expect(small.price.value).toBe(1200);
  });

  it("is identified by id (entity equality)", () => {
    const a = Variant.create({
      id: "var-1",
      label: "Large",
      price: Price.create(2000),
      position: 0,
    });
    const b = Variant.create({
      id: "var-1",
      label: "Renamed",
      price: Price.create(9999),
      position: 5,
    });
    expect(a.equals(b)).toBe(true);
  });

  it("is not equal to a variant with a different id", () => {
    const a = Variant.create({
      id: "var-1",
      label: "Large",
      price: Price.create(2000),
      position: 0,
    });
    const b = Variant.create({
      id: "var-2",
      label: "Large",
      price: Price.create(2000),
      position: 0,
    });
    expect(a.equals(b)).toBe(false);
  });

  it("clones into a fresh identity preserving label/price/position", () => {
    const original = Variant.create({
      id: "var-1",
      label: "Large",
      price: Price.create(2000),
      position: 3,
    });
    const clone = original.cloneWithId("var-99");
    expect(clone.id).toBe("var-99");
    expect(clone.label).toBe("Large");
    expect(clone.price.value).toBe(2000);
    expect(clone.position).toBe(3);
    expect(clone.equals(original)).toBe(false);
  });
});
