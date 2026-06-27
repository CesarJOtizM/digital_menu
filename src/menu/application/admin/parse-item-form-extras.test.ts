import { describe, expect, it } from "vitest";
import { CuidIdGenerator } from "@/menu/infrastructure/persistence";
import {
  parseModifierGroupsFromJson,
  parseVariantsFromJson,
} from "./parse-item-form-extras";

describe("parseVariantsFromJson", () => {
  it("parses variant rows with generated ids", () => {
    const variants = parseVariantsFromJson(
      JSON.stringify([{ label: "Mediana", price: "14.50" }]),
      new CuidIdGenerator(),
    );

    expect(variants).toHaveLength(1);
    expect(variants[0].label).toBe("Mediana");
    expect(variants[0].price.value).toBe(1450);
  });
});

describe("parseModifierGroupsFromJson", () => {
  it("parses modifier groups and options", () => {
    const groups = parseModifierGroupsFromJson(
      JSON.stringify([
        {
          name: "Extras",
          min: "0",
          max: "1",
          options: [{ name: "Queso", priceDelta: "1.50" }],
        },
      ]),
      new CuidIdGenerator(),
    );

    expect(groups).toHaveLength(1);
    expect(groups[0].name).toBe("Extras");
    expect(groups[0].options[0].name).toBe("Queso");
    expect(groups[0].options[0].priceDelta.value).toBe(150);
  });
});
