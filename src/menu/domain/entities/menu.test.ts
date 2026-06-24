import { describe, it, expect } from "vitest";
import { Menu, MENU_STATUS } from "./menu";
import { Category } from "./category";
import { Item } from "./item";
import { Price, ImageSource, Slug } from "@/shared/domain";
import { DuplicatePosition } from "../errors";

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

const makeCategory = (id: string, position: number, items: Item[] = []): Category =>
  Category.create({
    id,
    name: id,
    slug: Slug.fromName(id),
    position,
    items,
  });

const makeMenu = (categories: Category[]): Menu =>
  Menu.create({
    id: "menu-1",
    name: "Dinner",
    slug: Slug.fromName("Dinner"),
    categories,
  });

describe("Menu", () => {
  describe("ordering", () => {
    it("returns categories sorted by ascending position", () => {
      const menu = makeMenu([makeCategory("c2", 1), makeCategory("c1", 0)]);
      expect(menu.categories.map((c) => c.id)).toEqual(["c1", "c2"]);
    });

    it("returns items inside each category sorted by ascending position", () => {
      const menu = makeMenu([
        makeCategory("c1", 0, [makeItem("i2", 1), makeItem("i1", 0)]),
      ]);
      expect(menu.categories[0].items.map((i) => i.id)).toEqual(["i1", "i2"]);
    });

    it("returns an empty list for a menu with no categories (edge)", () => {
      const menu = makeMenu([]);
      expect(menu.categories).toEqual([]);
    });
  });

  describe("status", () => {
    it("starts in draft status", () => {
      const menu = makeMenu([makeCategory("c1", 0)]);
      expect(menu.status).toBe(MENU_STATUS.DRAFT);
    });

    it("publishes to published status", () => {
      const menu = makeMenu([makeCategory("c1", 0)]).publish();
      expect(menu.status).toBe(MENU_STATUS.PUBLISHED);
    });

    it("unpublishes back to draft", () => {
      const menu = makeMenu([makeCategory("c1", 0)]).publish().unpublish();
      expect(menu.status).toBe(MENU_STATUS.DRAFT);
    });
  });

  describe("reorderCategories", () => {
    it("applies a new explicit ordering by id", () => {
      const menu = makeMenu([makeCategory("c1", 0), makeCategory("c2", 1)]);
      const reordered = menu.reorderCategories(["c2", "c1"]);
      expect(reordered.categories.map((c) => c.id)).toEqual(["c2", "c1"]);
    });

    it("does not mutate the original menu (single transaction boundary)", () => {
      const menu = makeMenu([makeCategory("c1", 0), makeCategory("c2", 1)]);
      menu.reorderCategories(["c2", "c1"]);
      expect(menu.categories.map((c) => c.id)).toEqual(["c1", "c2"]);
    });

    it("rejects an ordering that does not cover every category exactly once", () => {
      const menu = makeMenu([makeCategory("c1", 0), makeCategory("c2", 1)]);
      expect(() => menu.reorderCategories(["c1", "c1"])).toThrow(DuplicatePosition);
    });
  });
});
