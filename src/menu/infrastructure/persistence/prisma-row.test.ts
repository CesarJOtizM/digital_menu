import { describe, it, expect } from "vitest";
import {
  prismaMenuToRow,
  type PrismaMenuWithRelations,
} from "./prisma-row";

describe("prismaMenuToRow", () => {
  const prismaMenu = (): PrismaMenuWithRelations => ({
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
            allergens: [
              { itemId: "item-1", allergenId: "gluten" },
              { itemId: "item-1", allergenId: "egg" },
            ],
            variants: [
              { id: "v1", itemId: "item-1", label: "Regular", price: 1500, sortOrder: 0 },
            ],
            modifierGroups: [
              {
                id: "g1",
                itemId: "item-1",
                name: "Extras",
                min: 0,
                max: 1,
                sortOrder: 0,
                options: [
                  { id: "o1", groupId: "g1", name: "Cheese", priceDelta: 300, sortOrder: 0 },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  it("flattens the Prisma include shape into a mapper MenuRow", () => {
    const row = prismaMenuToRow(prismaMenu());

    expect(row.id).toBe("menu-1");
    expect(row.status).toBe("published");
    expect(row.categories[0].items[0].basePrice).toBe(1500);
  });

  it("projects ItemAllergen join rows into a flat allergenIds array", () => {
    const row = prismaMenuToRow(prismaMenu());

    expect(row.categories[0].items[0].allergenIds).toEqual(["gluten", "egg"]);
  });

  it("preserves nested variant and modifier-option centavos", () => {
    const row = prismaMenuToRow(prismaMenu());
    const item = row.categories[0].items[0];

    expect(item.variants[0].price).toBe(1500);
    expect(item.modifierGroups[0].options[0].priceDelta).toBe(300);
  });

  it("defaults a null category description to null and empty relations to empty arrays", () => {
    const menu = prismaMenu();
    menu.categories[0].description = null;
    menu.categories[0].items[0].allergens = [];
    menu.categories[0].items[0].variants = [];
    menu.categories[0].items[0].modifierGroups = [];

    const row = prismaMenuToRow(menu);
    const item = row.categories[0].items[0];

    expect(row.categories[0].description).toBeNull();
    expect(item.allergenIds).toEqual([]);
    expect(item.variants).toEqual([]);
    expect(item.modifierGroups).toEqual([]);
  });
});
