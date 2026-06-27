/**
 * Azahar-style dummy-data seeder (DEV / SUPPORT SCRIPT — not domain logic).
 *
 * Purpose: populate a single PUBLISHED Menu + the Settings singleton so the `/`
 * (landing) and `/menu` routes render real content instead of the empty state.
 * Content mirrors the Azahar reference menu (azaharpr.com) for visual styling
 * review and to prepare for real Supabase integration.
 *
 * ── Money convention ────────────────────────────────────────────────────────
 * Every price/delta is an INTEGER amount of CENTAVOS (minor units). The display
 * layer divides by 10 ** decimalDigits (USD = 2), so 100 centavos = 1 major
 * unit. Therefore $15.00 => 1500, $16.00 => 1600, $3.00 delta => 300. NEVER use
 * floats here — the schema columns are Int and the domain rejects non-integers.
 *
 * ── Published status ────────────────────────────────────────────────────────
 * PrismaMenuRepository.findPublished() filters `where: { status: "published" }`,
 * so the seeded Menu MUST use the literal status "published" to render publicly.
 *
 * ── Landing JSON shape ──────────────────────────────────────────────────────
 * buildLandingViewModel() reads Settings.landing defensively. The blob shape is:
 *   { enabled, hero:{image,tagline}, about:{heading,body[]},
 *     hours:{heading,schedule:[{day,hours}]},
 *     location:{heading,address,mapUrl}, social:[{label,url}], cta:{label} }
 * `enabled: true` makes `/` render the landing (resolveRootView) and `/menu` the
 * menu. mapSettingsRowToConfig keys landingEnabled off `landing.enabled === true`.
 *
 * ── Connection ──────────────────────────────────────────────────────────────
 * Standalone CLI script: it builds its OWN PrismaClient with the @prisma/adapter-pg
 * driver adapter (the app's src/shared/.../client.ts is `server-only` and can't be
 * imported here). It connects via DIRECT_URL (direct, non-pooled) — the same
 * connection Prisma migrations use — which is the safe path for one-shot writes.
 *
 * ── Idempotency ─────────────────────────────────────────────────────────────
 * Wipe-then-insert: delete the menu tree (Menu cascade clears categories/items/
 * variants/modifiers/allergen links) + standalone Allergens, then re-insert with
 * STABLE ids. Settings is upserted on its fixed "default" id. Running the seed
 * twice produces the same result and never duplicates. NO auth/user data touched.
 */

import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// ── Constants ────────────────────────────────────────────────────────────────

const MENU_ID = "seed-menu-azahar";
const SETTINGS_ID = "default";
const PUBLISHED_STATUS = "published";

/** Local placeholder image (committed at public/uploads/items/placeholder.svg). */
const PLACEHOLDER_IMAGE_PATH = "/uploads/items/placeholder.svg";

/** Weekday bitmask helpers (bit 0 = Sunday .. bit 6 = Saturday). */
const WEEKDAY = {
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
} as const;

type Weekday = (typeof WEEKDAY)[keyof typeof WEEKDAY];

/** Pack weekdays into the availDays bitmask column. */
function daysMask(days: readonly Weekday[]): number {
  return days.reduce<number>((mask, day) => mask | (1 << day), 0);
}

/** Minute-of-day helper (0..1440) for availStart / availEnd. */
function hm(hours: number, minutes = 0): number {
  return hours * 60 + minutes;
}

// ── Seed data shapes (plain DTOs mirroring Prisma columns) ───────────────────

interface SeedVariant {
  label: string;
  price: number; // ABSOLUTE centavos
}

interface SeedModifierOption {
  name: string;
  priceDelta: number; // centavos added when selected
}

interface SeedModifierGroup {
  name: string;
  min: number;
  max: number;
  options: readonly SeedModifierOption[];
}

interface SeedAvailability {
  days: readonly Weekday[];
  start: number; // minute-of-day, inclusive
  end: number; // minute-of-day, exclusive
}

interface SeedItem {
  name: string;
  description?: string;
  basePrice: number; // centavos
  withImage?: boolean;
  active?: boolean;
  allergenSlugs?: readonly string[];
  variants?: readonly SeedVariant[];
  modifierGroups?: readonly SeedModifierGroup[];
  availability?: SeedAvailability;
}

interface SeedCategory {
  name: string;
  description?: string;
  availability?: SeedAvailability;
  items: readonly SeedItem[];
}

interface SeedAllergen {
  name: string;
  slug: string;
  icon?: string;
}

// ── Allergen vocabulary ──────────────────────────────────────────────────────

const ALLERGENS: readonly SeedAllergen[] = [
  { name: "Gluten", slug: "gluten", icon: "wheat" },
  { name: "Dairy", slug: "dairy", icon: "milk" },
  { name: "Shellfish", slug: "shellfish", icon: "shrimp" },
  { name: "Fish", slug: "fish", icon: "fish" },
  { name: "Egg", slug: "egg", icon: "egg" },
  { name: "Nuts", slug: "nuts", icon: "nut" },
] as const;

// ── Menu content (mirrors the Azahar reference menu) ─────────────────────────

const CATEGORIES: readonly SeedCategory[] = [
  {
    name: "Breakfast",
    description: "Served mornings only — available 6:00 AM to 11:00 AM, daily.",
    // Availability window so the "unavailable / shown-marked" UI behavior is
    // visible depending on the current local time.
    availability: {
      days: [WEEKDAY.SUN, WEEKDAY.MON, WEEKDAY.TUE, WEEKDAY.WED, WEEKDAY.THU, WEEKDAY.FRI, WEEKDAY.SAT],
      start: hm(6),
      end: hm(11),
    },
    items: [
      {
        name: "Mallorca De Jamón",
        description: "Sweet bread / Ham / Swiss cheese / Powdered sugar.",
        basePrice: 1200,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Avocado Toast",
        description: "Sourdough / Smashed avocado / Poached egg / Chili flakes.",
        basePrice: 1400,
        allergenSlugs: ["gluten", "egg"],
      },
    ],
  },
  {
    name: "Appetizers",
    items: [
      {
        name: "Croquetas (4)",
        description: "Ask about daily special.",
        basePrice: 1500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Chistorras",
        description: "Gouda Cheese / Spicy Guava / Sesame Seeds / Cilantro.",
        basePrice: 1600,
        withImage: true,
        allergenSlugs: ["dairy"],
      },
      {
        name: "Montaditos De Carne Ahumada",
        description: "Tostones / Smoked Pork / Pickled Onions.",
        basePrice: 2500,
        withImage: true,
      },
      {
        name: "Empanadillas (2)",
        description: "Ask about daily.",
        basePrice: 1600,
        withImage: true,
        allergenSlugs: ["gluten"],
      },
      {
        name: "Spicy Salmon Tartare",
        description: "Avocado / Sesame Oil / Cilantro / Malanga Chips.",
        basePrice: 2500,
        allergenSlugs: ["fish"],
      },
      {
        name: "Alcapurrias",
        description: "Chef choice.",
        basePrice: 1600,
        withImage: true,
      },
    ],
  },
  {
    name: "Salads",
    description: "Add: Chicken 14 / Salmon 19 / Shrimp 17",
    items: [
      {
        name: "Watermelon And Arugula",
        description: "Roasted Peanuts / Orange Segments / Feta Cheese.",
        basePrice: 1700,
        allergenSlugs: ["dairy", "nuts"],
      },
      {
        name: "Caesar",
        description: "House Made Dressing / Parmesan Cheese / Croutons.",
        basePrice: 1700,
        allergenSlugs: ["gluten", "dairy", "fish"],
      },
      {
        name: "Avocado And Tomato",
        description: "Tomatoes / Dill / Honey Dressing.",
        basePrice: 1700,
      },
      {
        name: "Caribbean",
        description: "Organic Greens / Tomatoes / Tropical Fruit / Avocado / Papaya Dressing.",
        basePrice: 1700,
      },
    ],
  },
  {
    name: "Sharing",
    items: [
      {
        name: "Fish Tacos",
        description: "Breaded Fried Fish / Pineapple Pico De Gallo / Sriracha Sour Cream / Cilantro.",
        basePrice: 1900,
        withImage: true,
        allergenSlugs: ["gluten", "fish", "dairy"],
      },
      {
        name: "KFC",
        description: "Korean Fried Chicken / Asian Sauce / Scallions / Sesame.",
        basePrice: 1900,
        withImage: true,
        allergenSlugs: ["gluten"],
      },
      {
        name: "Arroz con Pollo",
        description: "Rice / Chicken / Longaniza / Chicken Thighs / Parsley Aïoli.",
        basePrice: 2100,
        withImage: true,
        allergenSlugs: ["egg"],
      },
      {
        name: "Burrata",
        description: "Arugula / Truffle Honey / Crostinis.",
        basePrice: 2200,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Chicharrones De Pescado",
        description: "Fish / Pickled Onions / Cilantro / Parsley Aïoli.",
        basePrice: 1900,
        allergenSlugs: ["fish", "egg"],
      },
    ],
  },
  {
    name: "Barbacoa",
    items: [
      {
        name: "Pulpo",
        description: "Grilled Octopus / Cilantro Purée / Hummus.",
        basePrice: 3800,
        withImage: true,
        allergenSlugs: ["shellfish"],
      },
      {
        name: "Chicken Yakitoris (4)",
        description: "Chicken Skewers / Asian BBQ / Cilantro.",
        basePrice: 1900,
        withImage: true,
        allergenSlugs: ["gluten"],
      },
      {
        name: "Alitas Picantes (6)",
        description: "Hot Wings / Cilantro / Blue Cheese.",
        basePrice: 2100,
        withImage: true,
        allergenSlugs: ["dairy"],
      },
      {
        name: "Costillas",
        description: "St. Louis Ribs / Creole BBQ / Cilantro.",
        basePrice: 2500,
        withImage: true,
      },
    ],
  },
  {
    name: "Mains",
    items: [
      {
        name: "Camarones Al Ajillo",
        description: "Shrimp Scampi / Roasted Garlic Sauce / Butter / Cassava Mash.",
        basePrice: 3300,
        withImage: true,
        allergenSlugs: ["shellfish", "dairy"],
      },
      {
        name: "Churrasco",
        description: "Skirt Steak / Rice And Beans / Chimichurri.",
        basePrice: 3200,
        withImage: true,
        // Two variants to exercise size selection in the UI.
        variants: [
          { label: "8 oz", price: 3200 },
          { label: "12 oz", price: 4200 },
        ],
      },
      {
        name: "Pollo a la Parmigiana",
        description: "Chicken Milanaise / Marinara Sauce / Mozzarella / Rice & Beans.",
        basePrice: 2700,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Chillo Frito",
        description: "Whole Snapper / Tropical Mojo / Tostones.",
        basePrice: 3800,
        allergenSlugs: ["fish"],
      },
      {
        name: "Pescado Igillo",
        description: "Fresh Fish Fillet / Garlic Butter Sauce / Mamposteado.",
        basePrice: 3800,
        withImage: true,
        allergenSlugs: ["fish", "dairy"],
      },
      {
        name: "Mofongo De Camarones",
        description: "Shrimp / Creole Sauce / Cilantro.",
        basePrice: 3300,
        withImage: true,
        allergenSlugs: ["shellfish"],
      },
      {
        name: "1 Pollo",
        description: "Half Roast Chicken / Sweet Potato / Chicken Jus.",
        basePrice: 2400,
        withImage: true,
      },
      {
        name: "Ribeye",
        description: "16 oz Ribeye / Sweet Potato Cubes / Soy Glaze / Broccolini / Roasted Lemon.",
        basePrice: 6700,
      },
    ],
  },
  {
    name: "Burgers",
    items: [
      {
        name: "Bori",
        description: "Brioche Roll / Sweet Plantain / Guava Sauce / Cheddar Cheese / Bacon / Steak Cut Fries.",
        basePrice: 2500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Classic",
        description: "Brioche Roll / Cheddar Cheese / Onion / Bacon / Pink Sauce / Steak Cut Fries.",
        basePrice: 2500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy", "egg"],
      },
      {
        name: "French",
        description: "Brioche Roll / Blue Cheese / Onion Marmalade / Steak Cut Fries.",
        basePrice: 2500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Mushroom Swiss",
        description: "Brioche Roll / Swiss Cheese / Sauté Mushrooms / Steak Cut Fries.",
        basePrice: 2500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Chick Sandwich",
        description: "Brioche Roll / Pesto / Arugula / Honey Mustard / Steak Cut Fries.",
        basePrice: 2500,
        allergenSlugs: ["gluten", "egg"],
      },
    ],
  },
  {
    name: "Pastas",
    description: "Add: Chicken 14 / Salmon 19 / Shrimp 17",
    items: [
      {
        name: "Salmon Pasta",
        description: "Creamy Spinach / Mushrooms / Parmesan / Roasted Garlic.",
        basePrice: 3600,
        withImage: true,
        allergenSlugs: ["gluten", "dairy", "fish"],
      },
      {
        name: "Carbonara",
        description: "Cream / Parmesan / Bacon.",
        basePrice: 1700,
        withImage: true,
        allergenSlugs: ["gluten", "dairy", "egg"],
      },
      {
        name: "Pasta A La Vodka",
        description: "Creamy Tomato Vodka Sauce / Parmesan Cheese / Basil.",
        basePrice: 1700,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
    ],
  },
  {
    name: "Pizzas",
    items: [
      {
        name: "Longaniza",
        description: "Chicken Longaniza / Alfredo / Jalapeños / Cilantro / Fontina.",
        basePrice: 2300,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Three Cheese",
        description: "Mushroom / Fontina / Burrata / Mozzarella / Alfredo Sauce.",
        basePrice: 2300,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Pizza Del Campo",
        description:
          "Smoked Pork / Longaniza / Onions / Sweet Plantain / Tomato Sauce / Mozzarella / Queso Fresco.",
        basePrice: 2300,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Margarita",
        description: "Tomato Sauce / Mozzarella Buffalo / Basil.",
        basePrice: 2300,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Pepperoni",
        description: "Pepperoni / Tomato Sauce / Mozzarella.",
        basePrice: 2300,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Build your own Pizza",
        description: "Choose up to 6 ingredients. Additional ingredients $3.",
        basePrice: 2500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
        // Two modifier groups to exercise the modifier UI (extras + crust).
        modifierGroups: [
          {
            name: "Extra Toppings",
            min: 0,
            max: 6,
            options: [
              { name: "Pepperoni", priceDelta: 300 },
              { name: "Chicken Longaniza", priceDelta: 300 },
              { name: "Bacon", priceDelta: 300 },
              { name: "Onions", priceDelta: 300 },
              { name: "Mushrooms", priceDelta: 300 },
              { name: "Peppers", priceDelta: 300 },
              { name: "Anchovies", priceDelta: 300 },
              { name: "Tomatoes", priceDelta: 300 },
              { name: "Jalapeños", priceDelta: 300 },
              { name: "Fontina", priceDelta: 300 },
            ],
          },
          {
            name: "Crust",
            min: 1,
            max: 1,
            options: [
              { name: "Thin", priceDelta: 0 },
              { name: "Regular", priceDelta: 0 },
              { name: "Gluten-Free", priceDelta: 400 },
            ],
          },
        ],
      },
    ],
  },
] as const;

// ── Settings + landing blob (Azahar-style, USD / Puerto Rico) ────────────────

const LANDING_BLOB = {
  enabled: true,
  hero: {
    image: PLACEHOLDER_IMAGE_PATH,
    tagline: "We Have a Wood Burning Grill",
  },
  about: {
    heading: "About Us",
    body: [
      "All the food that goes on the grill will have a delicious smoky flavor.",
      "A modern Puerto Rican kitchen serving wood-fired plates, sharing dishes, and craft cocktails in the heart of Condado.",
    ],
  },
  hours: {
    heading: "Hours",
    schedule: [
      { day: "Monday", hours: "Closed" },
      { day: "Tuesday", hours: "5:00 PM – 11:00 PM" },
      { day: "Wednesday", hours: "5:00 PM – 11:00 PM" },
      { day: "Thursday", hours: "5:00 PM – 11:00 PM" },
      { day: "Friday", hours: "5:00 PM – 1:00 AM" },
      { day: "Saturday", hours: "12:00 PM – 1:00 AM" },
      { day: "Sunday", hours: "12:00 PM – 10:00 PM" },
    ],
  },
  location: {
    heading: "Find Us",
    address: "1054 Ashford Ave, Condado, San Juan, PR 00907",
    mapUrl: "https://maps.google.com/?q=Azahar+Condado+San+Juan+PR",
  },
  social: [
    { label: "Instagram", url: "https://instagram.com/azaharpr" },
    { label: "Facebook", url: "https://facebook.com/azaharpr" },
  ],
  cta: {
    label: "View Menu",
  },
} as const;

// ── Seeder ───────────────────────────────────────────────────────────────────

function createPrismaClient(): PrismaClient {
  // Use the DIRECT connection (non-pooled, port 5432) for one-shot writes — the
  // same connection Prisma migrations use. PgBouncer-pooled writes can trip
  // "prepared statement already exists" during bulk inserts.
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Seed requires DIRECT_URL (or DATABASE_URL) to be set.");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

async function wipeMenuTree(prisma: PrismaClient): Promise<void> {
  // Menu cascade clears Category → Item → Variant/ModifierGroup/Option and the
  // ItemAllergen links. Allergens are standalone, so clear them explicitly.
  // Idempotent: deleteMany on an empty table is a no-op. NO auth/user data here.
  await prisma.menu.deleteMany();
  await prisma.allergen.deleteMany();
}

async function seedAllergens(prisma: PrismaClient): Promise<Map<string, string>> {
  const bySlug = new Map<string, string>();
  for (const allergen of ALLERGENS) {
    const created = await prisma.allergen.create({
      data: { name: allergen.name, slug: allergen.slug, icon: allergen.icon ?? null },
    });
    bySlug.set(allergen.slug, created.id);
  }
  return bySlug;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function seedMenu(prisma: PrismaClient, allergenIdBySlug: Map<string, string>): Promise<void> {
  await prisma.menu.create({
    data: {
      id: MENU_ID,
      name: "Azahar",
      slug: "azahar",
      status: PUBLISHED_STATUS,
    },
  });

  let categoryOrder = 0;
  for (const category of CATEGORIES) {
    const availability = category.availability
      ? {
          availDays: daysMask(category.availability.days),
          availStart: category.availability.start,
          availEnd: category.availability.end,
        }
      : { availDays: null, availStart: null, availEnd: null };

    const createdCategory = await prisma.category.create({
      data: {
        menuId: MENU_ID,
        name: category.name,
        slug: slugify(category.name),
        sortOrder: categoryOrder,
        description: category.description ?? null,
        ...availability,
      },
    });
    categoryOrder += 1;

    let itemOrder = 0;
    for (const item of category.items) {
      const itemAvailability = item.availability
        ? {
            availDays: daysMask(item.availability.days),
            availStart: item.availability.start,
            availEnd: item.availability.end,
          }
        : { availDays: null, availStart: null, availEnd: null };

      const allergenIds = (item.allergenSlugs ?? [])
        .map((slug) => allergenIdBySlug.get(slug))
        .filter((id): id is string => id !== undefined);

      await prisma.item.create({
        data: {
          categoryId: createdCategory.id,
          name: item.name,
          slug: slugify(item.name),
          description: item.description ?? "",
          basePrice: item.basePrice,
          imagePath: item.withImage ? PLACEHOLDER_IMAGE_PATH : null,
          imageUrl: null,
          active: item.active ?? true,
          sortOrder: itemOrder,
          ...itemAvailability,
          variants: item.variants
            ? {
                create: item.variants.map((variant, index) => ({
                  label: variant.label,
                  price: variant.price,
                  sortOrder: index,
                })),
              }
            : undefined,
          modifierGroups: item.modifierGroups
            ? {
                create: item.modifierGroups.map((group, groupIndex) => ({
                  name: group.name,
                  min: group.min,
                  max: group.max,
                  sortOrder: groupIndex,
                  options: {
                    create: group.options.map((option, optionIndex) => ({
                      name: option.name,
                      priceDelta: option.priceDelta,
                      sortOrder: optionIndex,
                    })),
                  },
                })),
              }
            : undefined,
          allergens: allergenIds.length
            ? { create: allergenIds.map((allergenId) => ({ allergenId })) }
            : undefined,
        },
      });
      itemOrder += 1;
    }
  }
}

async function seedSettings(prisma: PrismaClient): Promise<void> {
  const data = {
    restaurantName: "Azahar",
    logoUrl: null,
    logoPath: null,
    // Azahar palette: terracotta accent over a warm cream background, navy as secondary.
    primaryColor: "#C0552E",
    secondaryColor: "#1B2A4A",
    currency: "USD",
    locale: "en-US",
    timezone: "America/Puerto_Rico",
    // Azahar shows bare numbers (no currency symbol) on the menu.
    showCurrencySymbol: false,
    landing: LANDING_BLOB,
  } as const;

  await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  });
}

async function main(): Promise<void> {
  const prisma = createPrismaClient();
  try {
    await wipeMenuTree(prisma);
    const allergenIdBySlug = await seedAllergens(prisma);
    await seedMenu(prisma, allergenIdBySlug);
    await seedSettings(prisma);

    const itemCount = CATEGORIES.reduce((sum, category) => sum + category.items.length, 0);
    console.log(
      `Seeded "Azahar" menu (status=${PUBLISHED_STATUS}): ` +
        `${CATEGORIES.length} categories, ${itemCount} items, ${ALLERGENS.length} allergens, ` +
        `Settings singleton with landing enabled.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
