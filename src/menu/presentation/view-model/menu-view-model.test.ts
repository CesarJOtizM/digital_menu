import { describe, expect, it } from "vitest";
import { ImageSource, Price, Slug } from "@/shared/domain";
import {
  AvailabilityResolver,
  AvailabilityWindow,
  Category,
  Item,
  Menu,
  ModifierGroup,
  ModifierOption,
  Variant,
} from "@/menu/domain";
import { buildMenuViewModel } from "./menu-view-model";

// A symbol-OFF (Azahar-style) bare-number formatter: centavos -> "24.50".
const bareFormatter = (centavos: number): string => (centavos / 100).toFixed(2);
// A symbol-ON formatter for the symbol toggle triangulation.
const symbolFormatter = (centavos: number): string =>
  `$${(centavos / 100).toFixed(2)}`;

const resolver = new AvailabilityResolver();
const TZ = "UTC";
// A Wednesday 12:00 UTC instant — used as the render "now".
const NOW = new Date("2024-01-03T12:00:00Z");

function makeItem(overrides: Partial<Parameters<typeof Item.create>[0]> = {}): Item {
  return Item.create({
    id: overrides.id ?? "item-1",
    name: overrides.name ?? "Croquetas",
    slug: overrides.slug ?? Slug.fromName(overrides.name ?? "Croquetas"),
    description: overrides.description ?? "Ask about daily special.",
    basePrice: overrides.basePrice ?? Price.create(1500),
    imageSource: overrides.imageSource ?? ImageSource.placeholder(),
    active: overrides.active ?? true,
    position: overrides.position ?? 0,
    allergenIds: overrides.allergenIds ?? [],
    variants: overrides.variants ?? [],
    modifierGroups: overrides.modifierGroups ?? [],
    availability: overrides.availability,
  });
}

function makeMenu(categories: Category[]): Menu {
  return Menu.create({
    id: "menu-1",
    name: "Signature",
    slug: Slug.fromName("Signature"),
    categories,
    status: "published",
  });
}

function makeCategory(
  items: Item[],
  overrides: Partial<Parameters<typeof Category.create>[0]> = {},
): Category {
  return Category.create({
    id: overrides.id ?? "cat-1",
    name: overrides.name ?? "Appetizers",
    slug: overrides.slug ?? Slug.fromName(overrides.name ?? "Appetizers"),
    position: overrides.position ?? 0,
    items,
    availability: overrides.availability,
  });
}

describe("buildMenuViewModel", () => {
  it("returns an empty, non-error view-model for a menu with no categories", () => {
    const menu = makeMenu([]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    expect(vm.isEmpty).toBe(true);
    expect(vm.categories).toEqual([]);
    expect(vm.restaurantName).toBe("Signature");
  });

  it("is not empty when there is at least one category with items", () => {
    const menu = makeMenu([makeCategory([makeItem()])]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    expect(vm.isEmpty).toBe(false);
    expect(vm.categories).toHaveLength(1);
    expect(vm.categories[0].name).toBe("Appetizers");
    expect(vm.categories[0].items).toHaveLength(1);
  });

  it("formats the effective price as a bare number when the symbol is off", () => {
    const menu = makeMenu([makeCategory([makeItem({ basePrice: Price.create(2450) })])]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    expect(vm.categories[0].items[0].priceDisplay).toBe("24.50");
  });

  it("formats the effective price with a symbol when the symbol is on", () => {
    const menu = makeMenu([makeCategory([makeItem({ basePrice: Price.create(2450) })])]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: symbolFormatter,
    });

    expect(vm.categories[0].items[0].priceDisplay).toBe("$24.50");
  });

  it("exposes a thumbnail path for an item with an image", () => {
    const menu = makeMenu([
      makeCategory([makeItem({ imageSource: ImageSource.local("/uploads/items/abc.jpg") })]),
    ]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    expect(vm.categories[0].items[0].imageUrl).toBe("/uploads/items/abc.jpg");
    expect(vm.categories[0].items[0].hasImage).toBe(true);
  });

  it("marks an item as text-only (no image) when the source is a placeholder", () => {
    const menu = makeMenu([
      makeCategory([makeItem({ imageSource: ImageSource.placeholder() })]),
    ]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    expect(vm.categories[0].items[0].hasImage).toBe(false);
    expect(vm.categories[0].items[0].imageUrl).toBeNull();
  });

  it("keeps an item but marks it unavailable when outside its window (NOT hidden)", () => {
    // Window: Monday only (day 1), 09:00-17:00. NOW is Wednesday -> unavailable.
    const mondayWindow = AvailabilityWindow.create({
      days: [1],
      startMinute: 9 * 60,
      endMinute: 17 * 60,
    });
    const menu = makeMenu([
      makeCategory([makeItem({ availability: mondayWindow })]),
    ]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    // The item is still present (shown), just flagged unavailable.
    expect(vm.categories[0].items).toHaveLength(1);
    expect(vm.categories[0].items[0].unavailable).toBe(true);
  });

  it("marks every item in a category unavailable when the CATEGORY window excludes now", () => {
    const mondayWindow = AvailabilityWindow.create({
      days: [1],
      startMinute: 9 * 60,
      endMinute: 17 * 60,
    });
    // Item has no window (always), but category gates it.
    const menu = makeMenu([
      makeCategory([makeItem()], { availability: mondayWindow }),
    ]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    expect(vm.categories[0].items[0].unavailable).toBe(true);
  });

  it("marks an item available when both item and category windows include now", () => {
    // Wednesday (day 3), 00:00-23:59 -> includes NOW (Wed 12:00).
    const allDayWed = AvailabilityWindow.create({
      days: [3],
      startMinute: 0,
      endMinute: 1439,
    });
    const menu = makeMenu([
      makeCategory([makeItem({ availability: allDayWed })], { availability: allDayWed }),
    ]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    expect(vm.categories[0].items[0].unavailable).toBe(false);
  });

  it("shapes variants into label + price-display pairs", () => {
    const variants = [
      Variant.create({ id: "v1", label: "Large", price: Price.create(2000), position: 0 }),
      Variant.create({ id: "v2", label: "Small", price: Price.create(1200), position: 1 }),
    ];
    const menu = makeMenu([makeCategory([makeItem({ variants })])]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    expect(vm.categories[0].items[0].variants).toEqual([
      { label: "Large", priceDisplay: "20.00" },
      { label: "Small", priceDisplay: "12.00" },
    ]);
  });

  it("shapes modifier groups with options and signed delta displays", () => {
    const group = ModifierGroup.create({
      id: "g1",
      name: "Extras",
      min: 0,
      max: 2,
      position: 0,
      options: [
        ModifierOption.create({ id: "o1", name: "Cheese", priceDelta: Price.create(300) }),
        ModifierOption.create({ id: "o2", name: "No salt", priceDelta: Price.create(0) }),
      ],
    });
    const menu = makeMenu([makeCategory([makeItem({ modifierGroups: [group] })])]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    const modifierGroups = vm.categories[0].items[0].modifierGroups;
    expect(modifierGroups).toHaveLength(1);
    expect(modifierGroups[0].name).toBe("Extras");
    expect(modifierGroups[0].options).toEqual([
      { name: "Cheese", priceDeltaDisplay: "+3.00" },
      { name: "No salt", priceDeltaDisplay: null },
    ]);
  });

  it("resolves allergen ids to names via the provided lookup, omitting unknown ids", () => {
    const menu = makeMenu([
      makeCategory([makeItem({ allergenIds: ["gluten", "nuts", "ghost"] })]),
    ]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
      allergenNames: { gluten: "Gluten", nuts: "Nuts" },
    });

    expect(vm.categories[0].items[0].allergens).toEqual(["Gluten", "Nuts"]);
  });

  it("falls back to an empty allergen list when no lookup is provided", () => {
    const menu = makeMenu([
      makeCategory([makeItem({ allergenIds: ["gluten"] })]),
    ]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    expect(vm.categories[0].items[0].allergens).toEqual([]);
  });

  it("preserves category and item ordering by position", () => {
    const itemA = makeItem({ id: "a", name: "Alpha", position: 1 });
    const itemB = makeItem({ id: "b", name: "Beta", position: 0 });
    const catX = makeCategory([itemA, itemB], { id: "x", name: "Second", position: 1 });
    const catY = makeCategory([makeItem({ id: "c", name: "Gamma" })], {
      id: "y",
      name: "First",
      position: 0,
    });
    const menu = makeMenu([catX, catY]);

    const vm = buildMenuViewModel(menu, {
      resolver,
      now: NOW,
      timezone: TZ,
      formatPrice: bareFormatter,
    });

    expect(vm.categories.map((c) => c.name)).toEqual(["First", "Second"]);
    expect(vm.categories[1].items.map((i) => i.name)).toEqual(["Beta", "Alpha"]);
  });
});
