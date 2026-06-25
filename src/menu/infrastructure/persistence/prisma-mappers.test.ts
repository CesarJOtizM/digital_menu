import { describe, it, expect } from "vitest";
import { Slug, Price, ImageSource } from "@/shared/domain";
import { Menu, Category, Item, AvailabilityWindow } from "@/menu/domain";
import {
  packAvailability,
  unpackAvailability,
  toDomainMenu,
  toDomainItem,
  toPersistenceMenu,
  type MenuRow,
  type ItemRow,
} from "./prisma-mappers";

describe("packAvailability / unpackAvailability", () => {
  it("returns null columns when there is no window (always available)", () => {
    expect(packAvailability(undefined)).toEqual({
      availDays: null,
      availStart: null,
      availEnd: null,
    });
  });

  it("packs days array into a weekday bitmask plus minute range", () => {
    // Sunday(0) + Wednesday(3) + Saturday(6) => bits 0,3,6 = 1 + 8 + 64 = 73
    const window = AvailabilityWindow.create({
      days: [0, 3, 6],
      startMinute: 540,
      endMinute: 1020,
    });

    expect(packAvailability(window)).toEqual({
      availDays: 73,
      availStart: 540,
      availEnd: 1020,
    });
  });

  it("unpacks a bitmask back into a sorted days array window", () => {
    const window = unpackAvailability(73, 540, 1020);

    expect(window).toBeInstanceOf(AvailabilityWindow);
    expect(window?.days).toEqual([0, 3, 6]);
    expect(window?.startMinute).toBe(540);
    expect(window?.endMinute).toBe(1020);
  });

  it("returns undefined when columns are null (always available)", () => {
    expect(unpackAvailability(null, null, null)).toBeUndefined();
  });

  it("round-trips every weekday combination losslessly", () => {
    const window = AvailabilityWindow.create({
      days: [1, 2, 4, 5],
      startMinute: 0,
      endMinute: 1440,
    });
    const packed = packAvailability(window);
    const restored = unpackAvailability(
      packed.availDays,
      packed.availStart,
      packed.availEnd,
    );

    expect(restored?.days).toEqual([1, 2, 4, 5]);
    expect(restored?.startMinute).toBe(0);
    expect(restored?.endMinute).toBe(1440);
  });
});

describe("toDomainItem", () => {
  const baseRow = (): ItemRow => ({
    id: "item-1",
    name: "Burger",
    slug: "burger",
    description: "Tasty",
    basePrice: 1500,
    imageUrl: null,
    imagePath: null,
    active: true,
    sortOrder: 0,
    availDays: null,
    availStart: null,
    availEnd: null,
    allergenIds: [],
    variants: [],
    modifierGroups: [],
  });

  it("maps a flat item row into a domain Item with integer centavos base price", () => {
    const item = toDomainItem(baseRow());

    expect(item.id).toBe("item-1");
    expect(item.name).toBe("Burger");
    expect(item.slug.value).toBe("burger");
    expect(item.basePrice.value).toBe(1500);
    expect(item.active).toBe(true);
  });

  it("resolves an external image url into an external ImageSource", () => {
    const item = toDomainItem({
      ...baseRow(),
      imageUrl: "https://cdn/x.png",
      imagePath: null,
    });

    expect(item.imageSource.type).toBe("external");
    expect(item.imageSource.url).toBe("https://cdn/x.png");
  });

  it("resolves a local image path into a local ImageSource (path wins over url)", () => {
    const item = toDomainItem({
      ...baseRow(),
      imageUrl: "https://cdn/x.png",
      imagePath: "/uploads/items/x.png",
    });

    expect(item.imageSource.type).toBe("local");
    expect(item.imageSource.url).toBe("/uploads/items/x.png");
  });

  it("maps variants with absolute centavos prices ordered by sortOrder", () => {
    const item = toDomainItem({
      ...baseRow(),
      variants: [
        { id: "v2", label: "Large", price: 2000, sortOrder: 1 },
        { id: "v1", label: "Small", price: 1500, sortOrder: 0 },
      ],
    });

    expect(item.variants.map((v) => v.id)).toEqual(["v1", "v2"]);
    expect(item.variants[0].price.value).toBe(1500);
    expect(item.effectivePrice("v2").value).toBe(2000);
  });

  it("maps modifier groups and options so effective price composes deltas", () => {
    const item = toDomainItem({
      ...baseRow(),
      modifierGroups: [
        {
          id: "g1",
          name: "Extras",
          min: 0,
          max: 2,
          sortOrder: 0,
          options: [
            { id: "o1", name: "Cheese", priceDelta: 300, sortOrder: 0 },
            { id: "o2", name: "Bacon", priceDelta: 150, sortOrder: 1 },
          ],
        },
      ],
    });

    // base 1500 + cheese 300 + bacon 150 = 1950
    expect(item.effectivePrice(undefined, ["o1", "o2"]).value).toBe(1950);
  });

  it("maps allergen ids referenced by the item", () => {
    const item = toDomainItem({ ...baseRow(), allergenIds: ["gluten", "egg"] });

    expect(item.allergenIds).toEqual(["gluten", "egg"]);
  });

  it("maps availability columns into a domain window", () => {
    const item = toDomainItem({
      ...baseRow(),
      availDays: 73,
      availStart: 540,
      availEnd: 1020,
    });

    expect(item.availability?.days).toEqual([0, 3, 6]);
  });
});

describe("toDomainMenu / toPersistenceMenu round-trip", () => {
  const menuRow = (): MenuRow => ({
    id: "menu-1",
    name: "Dinner",
    slug: "dinner",
    status: "published",
    categories: [
      {
        id: "cat-1",
        name: "Mains",
        slug: "mains",
        sortOrder: 0,
        description: "Main dishes",
        availDays: null,
        availStart: null,
        availEnd: null,
        items: [
          {
            id: "item-1",
            name: "Burger",
            slug: "burger",
            description: "Tasty",
            basePrice: 1500,
            imageUrl: null,
            imagePath: "/uploads/items/burger.png",
            active: true,
            sortOrder: 0,
            availDays: null,
            availStart: null,
            availEnd: null,
            allergenIds: ["gluten"],
            variants: [{ id: "v1", label: "Regular", price: 1500, sortOrder: 0 }],
            modifierGroups: [
              {
                id: "g1",
                name: "Extras",
                min: 0,
                max: 1,
                sortOrder: 0,
                options: [
                  { id: "o1", name: "Cheese", priceDelta: 300, sortOrder: 0 },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  it("maps a menu row into a published domain Menu aggregate", () => {
    const menu = toDomainMenu(menuRow());

    expect(menu).toBeInstanceOf(Menu);
    expect(menu.status).toBe("published");
    expect(menu.categories[0].items[0]).toBeInstanceOf(Item);
    expect(menu.categories[0].items[0].basePrice.value).toBe(1500);
  });

  it("serializes a domain Menu back into a persistence row preserving centavos", () => {
    const menu = toDomainMenu(menuRow());
    const row = toPersistenceMenu(menu);

    expect(row.id).toBe("menu-1");
    expect(row.slug).toBe("dinner");
    expect(row.status).toBe("published");
    expect(row.categories[0].items[0].basePrice).toBe(1500);
    expect(row.categories[0].items[0].imagePath).toBe("/uploads/items/burger.png");
    expect(row.categories[0].items[0].variants[0].price).toBe(1500);
    expect(row.categories[0].items[0].modifierGroups[0].options[0].priceDelta).toBe(300);
    expect(row.categories[0].items[0].allergenIds).toEqual(["gluten"]);
  });

  it("round-trips menu -> domain -> row without losing structure", () => {
    const original = menuRow();
    const restored = toPersistenceMenu(toDomainMenu(original));

    expect(restored.categories[0].items[0].id).toBe("item-1");
    expect(restored.categories).toHaveLength(1);
    expect(restored.categories[0].items[0].modifierGroups[0].options).toHaveLength(1);
  });
});

describe("toPersistenceMenu builds reconstructable image columns", () => {
  it("emits imagePath/null for local and null/imageUrl for external", () => {
    const local = Item.create({
      id: "i1",
      name: "A",
      slug: Slug.fromExisting("a"),
      description: "",
      basePrice: Price.create(100),
      imageSource: ImageSource.local("/p.png"),
      active: true,
      position: 0,
      allergenIds: [],
      variants: [],
      modifierGroups: [],
    });
    const external = Item.create({
      id: "i2",
      name: "B",
      slug: Slug.fromExisting("b"),
      description: "",
      basePrice: Price.create(200),
      imageSource: ImageSource.external("https://x/y.png"),
      active: true,
      position: 0,
      allergenIds: [],
      variants: [],
      modifierGroups: [],
    });

    const row = toPersistenceMenu(
      Menu.create({
        id: "m1",
        name: "M",
        slug: Slug.fromExisting("m1"),
        categories: [
          Category.create({
            id: "c1",
            name: "C",
            slug: Slug.fromExisting("c"),
            position: 0,
            items: [local, external],
          }),
        ],
      }),
    );

    const items = row.categories[0].items;
    expect(items[0].imagePath).toBe("/p.png");
    expect(items[0].imageUrl).toBeNull();
    expect(items[1].imageUrl).toBe("https://x/y.png");
    expect(items[1].imagePath).toBeNull();
  });
});
