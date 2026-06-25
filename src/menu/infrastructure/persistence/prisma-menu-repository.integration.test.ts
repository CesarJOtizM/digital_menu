import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Slug, Price, ImageSource } from "@/shared/domain";
import { Menu, Category, Item, Variant, ModifierGroup, ModifierOption, AvailabilityWindow } from "@/menu/domain";
import { PrismaMenuRepository } from "./prisma-menu-repository";

/**
 * DB-INTEGRATION TEST — SKIPPED BY DEFAULT.
 *
 * Requires a live, DISPOSABLE Postgres with the menu schema migrated. Set
 * TEST_DATABASE_URL (a DIRECT, non-pooled connection to a throwaway database)
 * to enable. NEVER point this at the production Supabase DB — it truncates
 * tables. Run the migration against that DB first:
 *   DIRECT_URL=$TEST_DATABASE_URL npx prisma migrate deploy
 *
 * This proves the Prisma adapter round-trips the Menu aggregate (categories,
 * items, variants, modifiers, allergens, availability, centavos) and cascades.
 */
const TEST_DB = process.env.TEST_DATABASE_URL;
const describeIfDb = TEST_DB ? describe : describe.skip;

describeIfDb("PrismaMenuRepository (integration)", () => {
  let prisma: PrismaClient;
  let repo: PrismaMenuRepository;

  beforeAll(() => {
    const adapter = new PrismaPg({ connectionString: TEST_DB });
    prisma = new PrismaClient({ adapter });
    repo = new PrismaMenuRepository(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Cascade deletes from Menu clear the whole tree; Allergen is standalone.
    await prisma.menu.deleteMany();
    await prisma.allergen.deleteMany();
  });

  function sampleMenu(): Menu {
    const variant = Variant.create({ id: "v1", label: "Large", price: Price.create(2000), position: 0 });
    const option = ModifierOption.create({ id: "o1", name: "Cheese", priceDelta: Price.create(300) });
    const group = ModifierGroup.create({ id: "g1", name: "Extras", min: 0, max: 1, position: 0, options: [option] });
    const item = Item.create({
      id: "item-1",
      name: "Burger",
      slug: Slug.fromExisting("burger"),
      description: "Tasty",
      basePrice: Price.create(1500),
      imageSource: ImageSource.local("/uploads/items/burger.png"),
      active: true,
      position: 0,
      allergenIds: ["gluten"],
      variants: [variant],
      modifierGroups: [group],
      availability: AvailabilityWindow.create({ days: [1, 2, 3], startMinute: 540, endMinute: 1020 }),
    });
    const category = Category.create({
      id: "cat-1",
      name: "Mains",
      slug: Slug.fromExisting("mains"),
      position: 0,
      items: [item],
    });
    return Menu.create({
      id: "menu-1",
      name: "Dinner",
      slug: Slug.fromExisting("dinner"),
      status: "published",
      categories: [category],
    });
  }

  it("round-trips a full Menu aggregate preserving centavos and structure", async () => {
    await prisma.allergen.create({ data: { id: "gluten", name: "Gluten", slug: "gluten" } });

    await repo.save(sampleMenu());
    const loaded = await repo.findById("menu-1");

    expect(loaded).not.toBeNull();
    expect(loaded!.status).toBe("published");
    const item = loaded!.categories[0].items[0];
    expect(item.basePrice.value).toBe(1500);
    expect(item.effectivePrice("v1", ["o1"]).value).toBe(2300);
    expect(item.allergenIds).toEqual(["gluten"]);
    expect(item.availability?.days).toEqual([1, 2, 3]);
  });

  it("cascades child deletes when a category is removed from the aggregate", async () => {
    await prisma.allergen.create({ data: { id: "gluten", name: "Gluten", slug: "gluten" } });
    await repo.save(sampleMenu());

    const emptied = Menu.create({
      id: "menu-1",
      name: "Dinner",
      slug: Slug.fromExisting("dinner"),
      status: "published",
      categories: [],
    });
    await repo.save(emptied);

    const loaded = await repo.findById("menu-1");
    expect(loaded!.categories).toEqual([]);
    expect(await prisma.item.count()).toBe(0);
    expect(await prisma.variant.count()).toBe(0);
    expect(await prisma.modifierOption.count()).toBe(0);
  });

  it("finds the published menu via findPublished", async () => {
    await prisma.allergen.create({ data: { id: "gluten", name: "Gluten", slug: "gluten" } });
    await repo.save(sampleMenu());

    const published = await repo.findPublished();
    expect(published?.id).toBe("menu-1");
  });
});
