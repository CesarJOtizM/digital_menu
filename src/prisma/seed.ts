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
 *   { enabled, hero:{image,headline,description,cta}, about:{heading,body[]},
 *     highlights:[{heading,body,cta?}], hours:{heading,schedule[]},
 *     location:{heading,address,mapUrl}, contact:{heading,phone,email},
 *     privateDining:{heading,body,cta?}, social:[{label,url}], cta:{label,href} }
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

/** Landing placeholders (committed at public/uploads/landing/*.svg). */
const LANDING_IMAGES = {
  hero: [
    "/uploads/landing/hero-1.svg",
    "/uploads/landing/hero-2.svg",
    "/uploads/landing/hero-3.svg",
  ],
  tapas: "/uploads/landing/feature-tapas.svg",
  dining: "/uploads/landing/feature-dining.svg",
  cocktails: "/uploads/landing/feature-cocktails.svg",
  chef: "/uploads/landing/feature-chef.svg",
  privateDining: "/uploads/landing/feature-private.svg",
} as const;

/** WhatsApp reservation links (Azahar front desk). */
const WHATSAPP_NUMBER = "17874828182";
const WHATSAPP_RESERVE_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me gustaría reservar una mesa en Azahar Modern Tasca.")}`;
const WHATSAPP_PRIVATE_DINING_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me gustaría consultar sobre eventos privados en Azahar Modern Tasca.")}`;

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
  labelEn: string;
  price: number; // ABSOLUTE centavos
}

interface SeedModifierOption {
  name: string;
  nameEn: string;
  priceDelta: number; // centavos added when selected
}

interface SeedModifierGroup {
  name: string;
  nameEn: string;
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
  nameEn: string;
  description?: string;
  descriptionEn?: string;
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
  nameEn: string;
  description?: string;
  descriptionEn?: string;
  availability?: SeedAvailability;
  items: readonly SeedItem[];
}

interface SeedAllergen {
  name: string;
  nameEn: string;
  slug: string;
  icon?: string;
}

// ── Allergen vocabulary ──────────────────────────────────────────────────────

const ALLERGENS: readonly SeedAllergen[] = [
  { name: "Gluten", nameEn: "Gluten", slug: "gluten", icon: "🌾" },
  { name: "Lácteos", nameEn: "Dairy", slug: "dairy", icon: "🥛" },
  { name: "Mariscos", nameEn: "Shellfish", slug: "shellfish", icon: "🦐" },
  { name: "Pescado", nameEn: "Fish", slug: "fish", icon: "🐟" },
  { name: "Huevo", nameEn: "Egg", slug: "egg", icon: "🥚" },
  { name: "Frutos secos", nameEn: "Nuts", slug: "nuts", icon: "🥜" },
] as const;

// ── Menu content (mirrors the Azahar reference menu) ─────────────────────────

const CATEGORIES: readonly SeedCategory[] = [
  {
    name: "Desayuno",
    nameEn: "Breakfast",
    description: "Solo por la mañana — disponible de 6:00 AM a 11:00 AM, todos los días.",
    descriptionEn: "Served mornings only — available 6:00 AM to 11:00 AM, daily.",
    availability: {
      days: [WEEKDAY.SUN, WEEKDAY.MON, WEEKDAY.TUE, WEEKDAY.WED, WEEKDAY.THU, WEEKDAY.FRI, WEEKDAY.SAT],
      start: hm(6),
      end: hm(11),
    },
    items: [
      {
        name: "Mallorca de jamón",
        nameEn: "Mallorca De Jamón",
        description: "Pan dulce / Jamón / Queso suizo / Azúcar en polvo.",
        descriptionEn: "Sweet bread / Ham / Swiss cheese / Powdered sugar.",
        basePrice: 1200,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Tostada de aguacate",
        nameEn: "Avocado Toast",
        description: "Pan de masa madre / Aguacate / Huevo pochado / Hojuelas de chile.",
        descriptionEn: "Sourdough / Smashed avocado / Poached egg / Chili flakes.",
        basePrice: 1400,
        allergenSlugs: ["gluten", "egg"],
      },
    ],
  },
  {
    name: "Aperitivos",
    nameEn: "Appetizers",
    items: [
      {
        name: "Croquetas (4)",
        nameEn: "Croquetas (4)",
        description: "Pregunta por la especialidad del día.",
        descriptionEn: "Ask about daily special.",
        basePrice: 1500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Chistorras",
        nameEn: "Chistorras",
        description: "Queso gouda / Guayaba picante / Semillas de sésamo / Cilantro.",
        descriptionEn: "Gouda Cheese / Spicy Guava / Sesame Seeds / Cilantro.",
        basePrice: 1600,
        withImage: true,
        allergenSlugs: ["dairy"],
      },
      {
        name: "Montaditos de carne ahumada",
        nameEn: "Montaditos De Carne Ahumada",
        description: "Tostones / Cerdo ahumado / Cebollas encurtidas.",
        descriptionEn: "Tostones / Smoked Pork / Pickled Onions.",
        basePrice: 2500,
        withImage: true,
      },
      {
        name: "Empanadillas (2)",
        nameEn: "Empanadillas (2)",
        description: "Pregunta por la especialidad del día.",
        descriptionEn: "Ask about daily.",
        basePrice: 1600,
        withImage: true,
        allergenSlugs: ["gluten"],
      },
      {
        name: "Tartar de salmón picante",
        nameEn: "Spicy Salmon Tartare",
        description: "Aguacate / Aceite de sésamo / Cilantro / Chips de malanga.",
        descriptionEn: "Avocado / Sesame Oil / Cilantro / Malanga Chips.",
        basePrice: 2500,
        allergenSlugs: ["fish"],
      },
      {
        name: "Alcapurrias",
        nameEn: "Alcapurrias",
        description: "Elección del chef.",
        descriptionEn: "Chef choice.",
        basePrice: 1600,
        withImage: true,
      },
    ],
  },
  {
    name: "Ensaladas",
    nameEn: "Salads",
    description: "Agrega: Pollo 14 / Salmón 19 / Camarones 17",
    descriptionEn: "Add: Chicken 14 / Salmon 19 / Shrimp 17",
    items: [
      {
        name: "Sandía y rúcula",
        nameEn: "Watermelon And Arugula",
        description: "Maní tostado / Segmentos de naranja / Queso feta.",
        descriptionEn: "Roasted Peanuts / Orange Segments / Feta Cheese.",
        basePrice: 1700,
        allergenSlugs: ["dairy", "nuts"],
      },
      {
        name: "César",
        nameEn: "Caesar",
        description: "Aderezo de la casa / Queso parmesano / Crutones.",
        descriptionEn: "House Made Dressing / Parmesan Cheese / Croutons.",
        basePrice: 1700,
        allergenSlugs: ["gluten", "dairy", "fish"],
      },
      {
        name: "Aguacate y tomate",
        nameEn: "Avocado And Tomato",
        description: "Tomates / Eneldo / Aderezo de miel.",
        descriptionEn: "Tomatoes / Dill / Honey Dressing.",
        basePrice: 1700,
      },
      {
        name: "Caribeña",
        nameEn: "Caribbean",
        description: "Verdes orgánicos / Tomates / Fruta tropical / Aguacate / Aderezo de papaya.",
        descriptionEn: "Organic Greens / Tomatoes / Tropical Fruit / Avocado / Papaya Dressing.",
        basePrice: 1700,
      },
    ],
  },
  {
    name: "Para compartir",
    nameEn: "Sharing",
    items: [
      {
        name: "Tacos de pescado",
        nameEn: "Fish Tacos",
        description: "Pescado empanizado / Pico de gallo de piña / Crema agria con sriracha / Cilantro.",
        descriptionEn: "Breaded Fried Fish / Pineapple Pico De Gallo / Sriracha Sour Cream / Cilantro.",
        basePrice: 1900,
        withImage: true,
        allergenSlugs: ["gluten", "fish", "dairy"],
      },
      {
        name: "KFC",
        nameEn: "KFC",
        description: "Pollo frito coreano / Salsa asiática / Cebollín / Sésamo.",
        descriptionEn: "Korean Fried Chicken / Asian Sauce / Scallions / Sesame.",
        basePrice: 1900,
        withImage: true,
        allergenSlugs: ["gluten"],
      },
      {
        name: "Arroz con pollo",
        nameEn: "Arroz con Pollo",
        description: "Arroz / Pollo / Longaniza / Muslo de pollo / Aioli de perejil.",
        descriptionEn: "Rice / Chicken / Longaniza / Chicken Thighs / Parsley Aïoli.",
        basePrice: 2100,
        withImage: true,
        allergenSlugs: ["egg"],
      },
      {
        name: "Burrata",
        nameEn: "Burrata",
        description: "Rúcula / Miel trufada / Crostinis.",
        descriptionEn: "Arugula / Truffle Honey / Crostinis.",
        basePrice: 2200,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Chicharrones de pescado",
        nameEn: "Chicharrones De Pescado",
        description: "Pescado / Cebollas encurtidas / Cilantro / Aioli de perejil.",
        descriptionEn: "Fish / Pickled Onions / Cilantro / Parsley Aïoli.",
        basePrice: 1900,
        allergenSlugs: ["fish", "egg"],
      },
    ],
  },
  {
    name: "Barbacoa",
    nameEn: "Barbacoa",
    items: [
      {
        name: "Pulpo",
        nameEn: "Pulpo",
        description: "Pulpo a la parrilla / Puré de cilantro / Hummus.",
        descriptionEn: "Grilled Octopus / Cilantro Purée / Hummus.",
        basePrice: 3800,
        withImage: true,
        allergenSlugs: ["shellfish"],
      },
      {
        name: "Yakitoris de pollo (4)",
        nameEn: "Chicken Yakitoris (4)",
        description: "Brochetas de pollo / BBQ asiático / Cilantro.",
        descriptionEn: "Chicken Skewers / Asian BBQ / Cilantro.",
        basePrice: 1900,
        withImage: true,
        allergenSlugs: ["gluten"],
      },
      {
        name: "Alitas picantes (6)",
        nameEn: "Alitas Picantes (6)",
        description: "Alitas picantes / Cilantro / Queso azul.",
        descriptionEn: "Hot Wings / Cilantro / Blue Cheese.",
        basePrice: 2100,
        withImage: true,
        allergenSlugs: ["dairy"],
      },
      {
        name: "Costillas",
        nameEn: "Costillas",
        description: "Costillas St. Louis / BBQ criollo / Cilantro.",
        descriptionEn: "St. Louis Ribs / Creole BBQ / Cilantro.",
        basePrice: 2500,
        withImage: true,
      },
    ],
  },
  {
    name: "Platos fuertes",
    nameEn: "Mains",
    items: [
      {
        name: "Camarones al ajillo",
        nameEn: "Camarones Al Ajillo",
        description: "Camarones scampi / Salsa de ajo asado / Mantequilla / Puré de yuca.",
        descriptionEn: "Shrimp Scampi / Roasted Garlic Sauce / Butter / Cassava Mash.",
        basePrice: 3300,
        withImage: true,
        allergenSlugs: ["shellfish", "dairy"],
      },
      {
        name: "Churrasco",
        nameEn: "Churrasco",
        description: "Skirt steak / Arroz con habichuelas / Chimichurri.",
        descriptionEn: "Skirt Steak / Rice And Beans / Chimichurri.",
        basePrice: 3200,
        withImage: true,
        variants: [
          { label: "8 oz", labelEn: "8 oz", price: 3200 },
          { label: "12 oz", labelEn: "12 oz", price: 4200 },
        ],
      },
      {
        name: "Pollo a la parmigiana",
        nameEn: "Pollo a la Parmigiana",
        description: "Pollo milanesa / Salsa marinara / Mozzarella / Arroz y habichuelas.",
        descriptionEn: "Chicken Milanaise / Marinara Sauce / Mozzarella / Rice & Beans.",
        basePrice: 2700,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Chillo frito",
        nameEn: "Chillo Frito",
        description: "Pargo entero / Mojo tropical / Tostones.",
        descriptionEn: "Whole Snapper / Tropical Mojo / Tostones.",
        basePrice: 3800,
        allergenSlugs: ["fish"],
      },
      {
        name: "Pescado igillo",
        nameEn: "Pescado Igillo",
        description: "Filete de pescado fresco / Salsa de mantequilla y ajo / Mamposteado.",
        descriptionEn: "Fresh Fish Fillet / Garlic Butter Sauce / Mamposteado.",
        basePrice: 3800,
        withImage: true,
        allergenSlugs: ["fish", "dairy"],
      },
      {
        name: "Mofongo de camarones",
        nameEn: "Mofongo De Camarones",
        description: "Camarones / Salsa criolla / Cilantro.",
        descriptionEn: "Shrimp / Creole Sauce / Cilantro.",
        basePrice: 3300,
        withImage: true,
        allergenSlugs: ["shellfish"],
      },
      {
        name: "Medio pollo",
        nameEn: "1 Pollo",
        description: "Medio pollo asado / Batata / Jus de pollo.",
        descriptionEn: "Half Roast Chicken / Sweet Potato / Chicken Jus.",
        basePrice: 2400,
        withImage: true,
      },
      {
        name: "Ribeye",
        nameEn: "Ribeye",
        description: "Ribeye 16 oz / Cubos de batata / Glaseado de soya / Brócoli / Limón asado.",
        descriptionEn: "16 oz Ribeye / Sweet Potato Cubes / Soy Glaze / Broccolini / Roasted Lemon.",
        basePrice: 6700,
      },
    ],
  },
  {
    name: "Hamburguesas",
    nameEn: "Burgers",
    items: [
      {
        name: "Bori",
        nameEn: "Bori",
        description: "Pan brioche / Plátano maduro / Salsa de guayaba / Cheddar / Tocino / Papas steak cut.",
        descriptionEn: "Brioche Roll / Sweet Plantain / Guava Sauce / Cheddar Cheese / Bacon / Steak Cut Fries.",
        basePrice: 2500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Clásica",
        nameEn: "Classic",
        description: "Pan brioche / Cheddar / Cebolla / Tocino / Salsa rosada / Papas steak cut.",
        descriptionEn: "Brioche Roll / Cheddar Cheese / Onion / Bacon / Pink Sauce / Steak Cut Fries.",
        basePrice: 2500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy", "egg"],
      },
      {
        name: "Francesa",
        nameEn: "French",
        description: "Pan brioche / Queso azul / Marmelada de cebolla / Papas steak cut.",
        descriptionEn: "Brioche Roll / Blue Cheese / Onion Marmalade / Steak Cut Fries.",
        basePrice: 2500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Champiñón suizo",
        nameEn: "Mushroom Swiss",
        description: "Pan brioche / Queso suizo / Champiñones salteados / Papas steak cut.",
        descriptionEn: "Brioche Roll / Swiss Cheese / Sauté Mushrooms / Steak Cut Fries.",
        basePrice: 2500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Sándwich de pollo",
        nameEn: "Chick Sandwich",
        description: "Pan brioche / Pesto / Rúcula / Mostaza miel / Papas steak cut.",
        descriptionEn: "Brioche Roll / Pesto / Arugula / Honey Mustard / Steak Cut Fries.",
        basePrice: 2500,
        allergenSlugs: ["gluten", "egg"],
      },
    ],
  },
  {
    name: "Pastas",
    nameEn: "Pastas",
    description: "Agrega: Pollo 14 / Salmón 19 / Camarones 17",
    descriptionEn: "Add: Chicken 14 / Salmon 19 / Shrimp 17",
    items: [
      {
        name: "Pasta con salmón",
        nameEn: "Salmon Pasta",
        description: "Espinaca cremosa / Champiñones / Parmesano / Ajo asado.",
        descriptionEn: "Creamy Spinach / Mushrooms / Parmesan / Roasted Garlic.",
        basePrice: 3600,
        withImage: true,
        allergenSlugs: ["gluten", "dairy", "fish"],
      },
      {
        name: "Carbonara",
        nameEn: "Carbonara",
        description: "Crema / Parmesano / Tocino.",
        descriptionEn: "Cream / Parmesan / Bacon.",
        basePrice: 1700,
        withImage: true,
        allergenSlugs: ["gluten", "dairy", "egg"],
      },
      {
        name: "Pasta a la vodka",
        nameEn: "Pasta A La Vodka",
        description: "Salsa cremosa de tomate y vodka / Parmesano / Albahaca.",
        descriptionEn: "Creamy Tomato Vodka Sauce / Parmesan Cheese / Basil.",
        basePrice: 1700,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
    ],
  },
  {
    name: "Pizzas",
    nameEn: "Pizzas",
    items: [
      {
        name: "Longaniza",
        nameEn: "Longaniza",
        description: "Longaniza de pollo / Alfredo / Jalapeños / Cilantro / Fontina.",
        descriptionEn: "Chicken Longaniza / Alfredo / Jalapeños / Cilantro / Fontina.",
        basePrice: 2300,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Tres quesos",
        nameEn: "Three Cheese",
        description: "Champiñón / Fontina / Burrata / Mozzarella / Salsa Alfredo.",
        descriptionEn: "Mushroom / Fontina / Burrata / Mozzarella / Alfredo Sauce.",
        basePrice: 2300,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Pizza del campo",
        nameEn: "Pizza Del Campo",
        description:
          "Cerdo ahumado / Longaniza / Cebollas / Plátano maduro / Salsa de tomate / Mozzarella / Queso fresco.",
        descriptionEn:
          "Smoked Pork / Longaniza / Onions / Sweet Plantain / Tomato Sauce / Mozzarella / Queso Fresco.",
        basePrice: 2300,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Margarita",
        nameEn: "Margarita",
        description: "Salsa de tomate / Mozzarella de búfala / Albahaca.",
        descriptionEn: "Tomato Sauce / Mozzarella Buffalo / Basil.",
        basePrice: 2300,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Pepperoni",
        nameEn: "Pepperoni",
        description: "Pepperoni / Salsa de tomate / Mozzarella.",
        descriptionEn: "Pepperoni / Tomato Sauce / Mozzarella.",
        basePrice: 2300,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
      },
      {
        name: "Arma tu pizza",
        nameEn: "Build your own Pizza",
        description: "Elige hasta 6 ingredientes. Ingredientes adicionales $3.",
        descriptionEn: "Choose up to 6 ingredients. Additional ingredients $3.",
        basePrice: 2500,
        withImage: true,
        allergenSlugs: ["gluten", "dairy"],
        modifierGroups: [
          {
            name: "Ingredientes extra",
            nameEn: "Extra Toppings",
            min: 0,
            max: 6,
            options: [
              { name: "Pepperoni", nameEn: "Pepperoni", priceDelta: 300 },
              { name: "Longaniza de pollo", nameEn: "Chicken Longaniza", priceDelta: 300 },
              { name: "Tocino", nameEn: "Bacon", priceDelta: 300 },
              { name: "Cebollas", nameEn: "Onions", priceDelta: 300 },
              { name: "Champiñones", nameEn: "Mushrooms", priceDelta: 300 },
              { name: "Pimientos", nameEn: "Peppers", priceDelta: 300 },
              { name: "Anchoas", nameEn: "Anchovies", priceDelta: 300 },
              { name: "Tomates", nameEn: "Tomatoes", priceDelta: 300 },
              { name: "Jalapeños", nameEn: "Jalapeños", priceDelta: 300 },
              { name: "Fontina", nameEn: "Fontina", priceDelta: 300 },
            ],
          },
          {
            name: "Masa",
            nameEn: "Crust",
            min: 1,
            max: 1,
            options: [
              { name: "Delgada", nameEn: "Thin", priceDelta: 0 },
              { name: "Regular", nameEn: "Regular", priceDelta: 0 },
              { name: "Sin gluten", nameEn: "Gluten-Free", priceDelta: 400 },
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
  seo: {
    title: "Azahar Modern Tasca | Tapas modernas y cócteles en Condado",
    description:
      "Tapas españolas con sabor boricua, cócteles de autor y vistas a la laguna en Condado, San Juan. Reserva por WhatsApp y explora nuestra carta digital.",
    keywords: [
      "Azahar",
      "restaurante Condado",
      "tapas San Juan",
      "cócteles Condado",
      "carta digital",
      "Hilton Garden Inn Condado",
    ],
    ogImage: "/uploads/landing/hero-1.svg",
  },
  hero: {
    images: LANDING_IMAGES.hero,
    headline: "Tapas modernas, vistas al atardecer",
    description:
      "Azahar Modern Tasca trae cocina inspirada en España a Condado: bocados elaborados, sabores locales, cócteles de autor y un ambiente junto a la laguna para tardes largas, drinks al atardecer y noches relajadas.",
    cta: { label: "Ver carta", href: "/menu" },
  },
  about: {
    heading: "Bienvenidos a Azahar Modern Tasca",
    body: [
      "Ubicados en el Hilton Garden Inn San Juan Condado, Azahar combina el espíritu de una tasca española con el ritmo de Puerto Rico.",
      "Desde tapas y platos elaborados hasta vinos, cócteles y vistas desde la terraza: un lugar para reunirse sin prisa, compartir a menudo y quedarse hasta el atardecer.",
    ],
  },
  highlights: [
    {
      heading: "Tapas españolas, sabor local",
      body: "Azahar reimagina la tasca tradicional con platos para compartir — vibrantes, sabrosos y con influencia española y calidez caribeña.",
      image: LANDING_IMAGES.tapas,
      cta: { label: "Ver carta", href: "/menu" },
    },
    {
      heading: "Un momento gastronómico en Condado",
      body: "Una experiencia cálida y pulida en Condado, con platos llenos de sabor, cócteles y un ritmo nocturno relajado.",
      image: LANDING_IMAGES.dining,
      cta: { label: "Reservar", href: WHATSAPP_RESERVE_URL },
    },
    {
      heading: "Cócteles con vista",
      body: "En la barra, Azahar celebra lo social: cócteles de autor, vino, conversación y un ambiente que pasa de tardes tranquilas a noches animadas.",
      image: LANDING_IMAGES.cocktails,
      cta: { label: "Ver carta", href: "/menu" },
    },
    {
      heading: "A cargo de la chef Atisha Pascual",
      body: "La chef Atisha Pascual guía una carta donde técnica española, sabor local y emplatado contemporáneo se unen en una experiencia elegante y acogedora en Condado.",
      image: LANDING_IMAGES.chef,
      imageAlt: "Chef Atisha Pascual",
      cta: { label: "Contáctanos", href: "mailto:info@azaharpr.com" },
    },
  ],
  hours: {
    heading: "Horario semanal",
    schedule: [
      { day: "Domingo", hours: "11:00 AM – 11:00 PM" },
      { day: "Lunes", hours: "11:00 AM – 11:00 PM" },
      { day: "Martes", hours: "11:00 AM – 11:00 PM" },
      { day: "Miércoles", hours: "11:00 AM – 11:00 PM" },
      { day: "Jueves", hours: "11:00 AM – 11:00 PM" },
      { day: "Viernes", hours: "11:00 AM – 11:00 PM" },
      { day: "Sábado", hours: "11:00 AM – 11:00 PM" },
    ],
  },
  location: {
    heading: "Ubicación",
    address: "886 Ashford Ave, San Juan, 00907, Puerto Rico",
    mapUrl: "https://maps.google.com/?q=Azahar+886+Ashford+Ave+San+Juan+PR",
  },
  contact: {
    heading: "Contacto",
    phone: "(787) 482-8182",
    email: "info@azaharpr.com",
  },
  privateDining: {
    heading: "Eventos privados y celebraciones",
    body: "Cumpleaños, reuniones corporativas y ocasiones especiales con cócteles, cocina y ambiente junto a la laguna, adaptados a tu evento.",
    image: LANDING_IMAGES.privateDining,
    cta: { label: "Reservar mesa", href: WHATSAPP_PRIVATE_DINING_URL },
  },
  social: [
    { label: "Instagram", url: "https://instagram.com/azaharpr" },
    { label: "Facebook", url: "https://facebook.com/azaharpr" },
  ],
  cta: {
    label: "Ver carta",
    href: "/menu",
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
      data: {
        name: allergen.name,
        nameEn: allergen.nameEn,
        slug: allergen.slug,
        icon: allergen.icon ?? null,
      },
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
        nameEn: category.nameEn,
        slug: slugify(category.nameEn),
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
          nameEn: item.nameEn,
          slug: slugify(item.nameEn),
          description: item.description ?? "",
          descriptionEn: item.descriptionEn ?? null,
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
                  labelEn: variant.labelEn,
                  price: variant.price,
                  sortOrder: index,
                })),
              }
            : undefined,
          modifierGroups: item.modifierGroups
            ? {
                create: item.modifierGroups.map((group, groupIndex) => ({
                  name: group.name,
                  nameEn: group.nameEn,
                  min: group.min,
                  max: group.max,
                  sortOrder: groupIndex,
                  options: {
                    create: group.options.map((option, optionIndex) => ({
                      name: option.name,
                      nameEn: option.nameEn,
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
    restaurantName: "Azahar Modern Tasca",
    logoUrl: null,
    logoPath: null,
    // Azahar palette: terracotta accent over a warm cream background, navy as secondary.
    primaryColor: "#C0552E",
    secondaryColor: "#1B2A4A",
    currency: "USD",
    locale: "es-PR",
    timezone: "America/Puerto_Rico",
    // Azahar shows bare numbers (no currency symbol) on the menu.
    showCurrencySymbol: false,
    defaultMenuViewMode: "list",
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
        `${CATEGORIES.length} categories, ${itemCount} items, ${ALLERGENS.length} allergens ` +
        `(ES + EN), Settings singleton with landing enabled.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
