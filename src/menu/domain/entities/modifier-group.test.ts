import { describe, it, expect } from "vitest";
import { ModifierGroup } from "./modifier-group";
import { ModifierOption } from "../value-objects/modifier-option";
import { Price } from "@/shared/domain";
import {
  InvalidModifierGroup,
  ModifierSelectionBelowMin,
  ModifierSelectionAboveMax,
  UnknownModifierOption,
} from "../errors";

const option = (id: string, delta: number): ModifierOption =>
  ModifierOption.create({ id, name: id, priceDelta: Price.create(delta) });

describe("ModifierOption", () => {
  it("carries a priceDelta in centavos", () => {
    const opt = ModifierOption.create({
      id: "opt-1",
      name: "Extra cheese",
      priceDelta: Price.create(300),
    });
    expect(opt.id).toBe("opt-1");
    expect(opt.name).toBe("Extra cheese");
    expect(opt.priceDelta.value).toBe(300);
  });

  it("defaults priceDelta to zero centavos when omitted", () => {
    const opt = ModifierOption.create({ id: "opt-2", name: "No onion" });
    expect(opt.priceDelta.value).toBe(0);
  });
});

describe("ModifierGroup", () => {
  describe("create", () => {
    it("builds a group with min/max bounds and options", () => {
      const group = ModifierGroup.create({
        id: "grp-1",
        name: "Size",
        min: 1,
        max: 2,
        position: 0,
        options: [option("opt-a", 100), option("opt-b", 200)],
      });
      expect(group.id).toBe("grp-1");
      expect(group.min).toBe(1);
      expect(group.max).toBe(2);
      expect(group.options).toHaveLength(2);
    });

    it("rejects a negative min", () => {
      expect(() =>
        ModifierGroup.create({
          id: "g",
          name: "n",
          min: -1,
          max: 1,
          position: 0,
          options: [option("opt-a", 0)],
        }),
      ).toThrow(InvalidModifierGroup);
    });

    it("rejects max less than min", () => {
      expect(() =>
        ModifierGroup.create({
          id: "g",
          name: "n",
          min: 2,
          max: 1,
          position: 0,
          options: [option("opt-a", 0), option("opt-b", 0)],
        }),
      ).toThrow(InvalidModifierGroup);
    });

    it("rejects max greater than the number of options", () => {
      expect(() =>
        ModifierGroup.create({
          id: "g",
          name: "n",
          min: 0,
          max: 3,
          position: 0,
          options: [option("opt-a", 0), option("opt-b", 0)],
        }),
      ).toThrow(InvalidModifierGroup);
    });
  });

  describe("validateSelection", () => {
    const group = ModifierGroup.create({
      id: "grp-1",
      name: "Toppings",
      min: 1,
      max: 2,
      position: 0,
      options: [option("opt-a", 100), option("opt-b", 200), option("opt-c", 300)],
    });

    it("passes when the selection count is within bounds", () => {
      expect(() => group.validateSelection(["opt-a"])).not.toThrow();
      expect(() => group.validateSelection(["opt-a", "opt-b"])).not.toThrow();
    });

    it("fails the min bound when too few options are selected", () => {
      expect(() => group.validateSelection([])).toThrow(ModifierSelectionBelowMin);
    });

    it("fails the max bound when too many options are selected", () => {
      expect(() =>
        group.validateSelection(["opt-a", "opt-b", "opt-c"]),
      ).toThrow(ModifierSelectionAboveMax);
    });

    it("rejects an option id that does not belong to the group", () => {
      expect(() => group.validateSelection(["opt-z"])).toThrow(
        UnknownModifierOption,
      );
    });
  });

  describe("priceDeltaFor", () => {
    const group = ModifierGroup.create({
      id: "grp-1",
      name: "Toppings",
      min: 0,
      max: 2,
      position: 0,
      options: [option("opt-a", 300), option("opt-b", 150)],
    });

    it("sums the deltas of the selected options in centavos", () => {
      expect(group.priceDeltaFor(["opt-a", "opt-b"]).value).toBe(450);
    });

    it("returns zero when no options are selected", () => {
      expect(group.priceDeltaFor([]).value).toBe(0);
    });

    it("throws for an option id outside the group", () => {
      expect(() => group.priceDeltaFor(["opt-x"])).toThrow(UnknownModifierOption);
    });
  });

  describe("cloneWithFreshIds", () => {
    it("produces a group and options with brand-new ids, preserving data", () => {
      const group = ModifierGroup.create({
        id: "grp-1",
        name: "Toppings",
        min: 0,
        max: 1,
        position: 2,
        options: [option("opt-a", 300)],
      });
      let counter = 0;
      const clone = group.cloneWithFreshIds(() => `fresh-${counter++}`);
      expect(clone.id).toBe("fresh-0");
      expect(clone.name).toBe("Toppings");
      expect(clone.min).toBe(0);
      expect(clone.max).toBe(1);
      expect(clone.position).toBe(2);
      expect(clone.options[0].id).toBe("fresh-1");
      expect(clone.options[0].priceDelta.value).toBe(300);
      expect(clone.id).not.toBe(group.id);
      expect(clone.options[0].id).not.toBe(group.options[0].id);
    });
  });
});
