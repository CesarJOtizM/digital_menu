import type {
  MenuRow,
  CategoryRow,
  ItemRow,
  VariantRow,
  ModifierGroupRow,
  ModifierOptionRow,
} from "./prisma-mappers";

/**
 * Shapes mirroring a Prisma read with nested includes (Menu -> categories ->
 * items -> variants / modifierGroups -> options + allergens join rows). Declared
 * as plain structural types so the flattening function stays PURE and unit
 * testable without a live database or the generated client. The repository
 * adapter passes the real Prisma include result (which is assignable to these).
 */

export interface PrismaItemAllergenRow {
  itemId: string;
  allergenId: string;
}

export interface PrismaModifierOptionRow {
  id: string;
  groupId: string;
  name: string;
  priceDelta: number;
  sortOrder: number;
}

export interface PrismaModifierGroupRow {
  id: string;
  itemId: string;
  name: string;
  min: number;
  max: number;
  sortOrder: number;
  options: PrismaModifierOptionRow[];
}

export interface PrismaVariantRow {
  id: string;
  itemId: string;
  label: string;
  price: number;
  sortOrder: number;
}

export interface PrismaItemRow {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string | null;
  imagePath: string | null;
  active: boolean;
  sortOrder: number;
  availDays: number | null;
  availStart: number | null;
  availEnd: number | null;
  allergens: PrismaItemAllergenRow[];
  variants: PrismaVariantRow[];
  modifierGroups: PrismaModifierGroupRow[];
}

export interface PrismaCategoryRow {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  description: string | null;
  availDays: number | null;
  availStart: number | null;
  availEnd: number | null;
  items: PrismaItemRow[];
}

export interface PrismaMenuWithRelations {
  id: string;
  name: string;
  slug: string;
  status: string;
  categories: PrismaCategoryRow[];
}

function optionToRow(option: PrismaModifierOptionRow): ModifierOptionRow {
  return {
    id: option.id,
    name: option.name,
    priceDelta: option.priceDelta,
    sortOrder: option.sortOrder,
  };
}

function groupToRow(group: PrismaModifierGroupRow): ModifierGroupRow {
  return {
    id: group.id,
    name: group.name,
    min: group.min,
    max: group.max,
    sortOrder: group.sortOrder,
    options: group.options.map(optionToRow),
  };
}

function variantToRow(variant: PrismaVariantRow): VariantRow {
  return {
    id: variant.id,
    label: variant.label,
    price: variant.price,
    sortOrder: variant.sortOrder,
  };
}

function itemToRow(item: PrismaItemRow): ItemRow {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    basePrice: item.basePrice,
    imageUrl: item.imageUrl,
    imagePath: item.imagePath,
    active: item.active,
    sortOrder: item.sortOrder,
    availDays: item.availDays,
    availStart: item.availStart,
    availEnd: item.availEnd,
    allergenIds: item.allergens.map((link) => link.allergenId),
    variants: item.variants.map(variantToRow),
    modifierGroups: item.modifierGroups.map(groupToRow),
  };
}

function categoryToRow(category: PrismaCategoryRow): CategoryRow {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
    description: category.description,
    availDays: category.availDays,
    availStart: category.availStart,
    availEnd: category.availEnd,
    items: category.items.map(itemToRow),
  };
}

/** Flatten a Prisma menu-with-relations read into a pure mapper MenuRow. */
export function prismaMenuToRow(menu: PrismaMenuWithRelations): MenuRow {
  return {
    id: menu.id,
    name: menu.name,
    slug: menu.slug,
    status: menu.status,
    categories: menu.categories.map(categoryToRow),
  };
}
