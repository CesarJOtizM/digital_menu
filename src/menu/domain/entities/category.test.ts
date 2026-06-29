import { describe, it, expect } from "vitest";
import { Category } from "./category";
import { Item } from "./item";
import { AvailabilityWindow } from "../value-objects/availability-window";
import { Price, ImageSource, Slug } from "@/shared/domain";

const makeItem = (id: string, position: number): Item =>
  Item.create({
    id,
    name: id,
    slug: Slug.fromName(id),
    description: "",
    basePrice: Price.create(1000),
    imageSource: ImageSource.placeholder(),
    active: true,
    position,
    allergenIds: [],
    variants: [],
    modifierGroups: [],
  });

describe("Category", () => {
  it("exposes items sorted by ascending position", () => {
    const category = Category.create({
      id: "cat-1",
      name: "Mains",
      slug: Slug.fromName("Mains"),
      position: 0,
      items: [makeItem("i2", 1), makeItem("i1", 0)],
    });
    expect(category.items.map((i) => i.id)).toEqual(["i1", "i2"]);
  });

  it("carries an optional availability window", () => {
    const window = AvailabilityWindow.create({
      days: [6],
      startMinute: 600,
      endMinute: 720,
    });
    const category = Category.create({
      id: "cat-1",
      name: "Brunch",
      slug: Slug.fromName("Brunch"),
      position: 0,
      items: [],
      availability: window,
    });
    expect(category.availability?.days).toEqual([6]);
  });

  describe("reorderItems", () => {
    it("applies a new explicit ordering by id", () => {
      const category = Category.create({
        id: "cat-1",
        name: "Mains",
        slug: Slug.fromName("Mains"),
        position: 0,
        items: [makeItem("i1", 0), makeItem("i2", 1)],
      });
      const reordered = category.reorderItems(["i2", "i1"]);
      expect(reordered.items.map((item) => item.id)).toEqual(["i2", "i1"]);
    });

    it("does not mutate the original category", () => {
      const category = Category.create({
        id: "cat-1",
        name: "Mains",
        slug: Slug.fromName("Mains"),
        position: 0,
        items: [makeItem("i1", 0), makeItem("i2", 1)],
      });
      category.reorderItems(["i2", "i1"]);
      expect(category.items.map((item) => item.id)).toEqual(["i1", "i2"]);
    });
  });
});
