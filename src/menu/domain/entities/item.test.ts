import { describe, it, expect } from "vitest";
import { Item } from "./item";
import { Variant } from "./variant";
import { ModifierGroup } from "./modifier-group";
import { ModifierOption } from "../value-objects/modifier-option";
import { AvailabilityWindow } from "../value-objects/availability-window";
import { Price, ImageSource, Slug } from "@/shared/domain";
import { UnknownVariant } from "../errors";

const option = (id: string, delta: number): ModifierOption =>
  ModifierOption.create({ id, name: id, priceDelta: Price.create(delta) });

const baseItem = (overrides: Partial<Parameters<typeof Item.create>[0]> = {}) =>
  Item.create({
    id: "item-1",
    name: "Burger",
    slug: Slug.fromName("Burger"),
    description: "Tasty",
    basePrice: Price.create(1500),
    imageSource: ImageSource.placeholder(),
    active: true,
    position: 0,
    allergenIds: [],
    variants: [],
    modifierGroups: [],
    ...overrides,
  });

describe("Item.effectivePrice", () => {
  it("uses the base price when there is no variant and no modifiers", () => {
    const item = baseItem();
    expect(item.effectivePrice().value).toBe(1500);
  });

  it("uses the variant ABSOLUTE price (override, not additive) when selected", () => {
    const item = baseItem({
      variants: [
        Variant.create({
          id: "var-large",
          label: "Large",
          price: Price.create(2000),
          position: 0,
        }),
      ],
    });
    expect(item.effectivePrice("var-large").value).toBe(2000);
  });

  it("composes variant absolute price plus selected modifier deltas", () => {
    const item = baseItem({
      variants: [
        Variant.create({
          id: "var-large",
          label: "Large",
          price: Price.create(2000),
          position: 0,
        }),
      ],
      modifierGroups: [
        ModifierGroup.create({
          id: "grp-1",
          name: "Extras",
          min: 0,
          max: 2,
          position: 0,
          options: [option("opt-bacon", 300), option("opt-egg", 150)],
        }),
      ],
    });
    const price = item.effectivePrice("var-large", ["opt-bacon", "opt-egg"]);
    expect(price.value).toBe(2450);
  });

  it("adds modifier deltas to the BASE price when no variant is selected", () => {
    const item = baseItem({
      modifierGroups: [
        ModifierGroup.create({
          id: "grp-1",
          name: "Extras",
          min: 0,
          max: 1,
          position: 0,
          options: [option("opt-bacon", 300)],
        }),
      ],
    });
    expect(item.effectivePrice(undefined, ["opt-bacon"]).value).toBe(1800);
  });

  it("computes purely in integer centavos (no floating point)", () => {
    const item = baseItem();
    const result = item.effectivePrice();
    expect(Number.isInteger(result.value)).toBe(true);
  });

  it("throws when the selected variant id is unknown", () => {
    const item = baseItem();
    expect(() => item.effectivePrice("var-missing")).toThrow(UnknownVariant);
  });

  it("validates modifier group min/max via the group rules", () => {
    const item = baseItem({
      modifierGroups: [
        ModifierGroup.create({
          id: "grp-1",
          name: "Required",
          min: 1,
          max: 1,
          position: 0,
          options: [option("opt-a", 100), option("opt-b", 200)],
        }),
      ],
    });
    // min=1 not satisfied when no option selected for that group
    expect(() => item.effectivePrice(undefined, [])).toThrow();
  });
});

describe("Item ordering and metadata", () => {
  it("exposes variants sorted by ascending position", () => {
    const item = baseItem({
      variants: [
        Variant.create({ id: "v2", label: "B", price: Price.create(200), position: 1 }),
        Variant.create({ id: "v1", label: "A", price: Price.create(100), position: 0 }),
      ],
    });
    expect(item.variants.map((v) => v.id)).toEqual(["v1", "v2"]);
  });

  it("exposes modifier groups sorted by ascending position", () => {
    const item = baseItem({
      modifierGroups: [
        ModifierGroup.create({
          id: "g2",
          name: "Two",
          min: 0,
          max: 1,
          position: 1,
          options: [option("o2", 0)],
        }),
        ModifierGroup.create({
          id: "g1",
          name: "One",
          min: 0,
          max: 1,
          position: 0,
          options: [option("o1", 0)],
        }),
      ],
    });
    expect(item.modifierGroups.map((g) => g.id)).toEqual(["g1", "g2"]);
  });

  it("references allergens by id", () => {
    const item = baseItem({ allergenIds: ["gluten", "dairy"] });
    expect(item.allergenIds).toEqual(["gluten", "dairy"]);
  });

  it("carries an optional availability window", () => {
    const window = AvailabilityWindow.create({
      days: [1, 2, 3, 4, 5],
      startMinute: 540,
      endMinute: 1020,
    });
    const item = baseItem({ availability: window });
    expect(item.availability?.startMinute).toBe(540);
  });
});

describe("Item.replaceModifierGroups", () => {
  it("returns an item with the new groups, leaving the original untouched", () => {
    const original = baseItem({
      modifierGroups: [
        ModifierGroup.create({
          id: "g-old",
          name: "Old",
          min: 0,
          max: 1,
          position: 0,
          options: [option("o-old", 100)],
        }),
      ],
    });
    const newGroup = ModifierGroup.create({
      id: "g-new",
      name: "New",
      min: 0,
      max: 1,
      position: 0,
      options: [option("o-new", 500)],
    });
    const updated = original.replaceModifierGroups([newGroup]);
    expect(updated.modifierGroups.map((g) => g.id)).toEqual(["g-new"]);
    expect(original.modifierGroups.map((g) => g.id)).toEqual(["g-old"]);
  });
});
