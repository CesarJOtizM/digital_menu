import { Price, Slug, ImageSource, IMAGE_SOURCE_TYPE } from "@/shared/domain";
import {
  Menu,
  Category,
  Item,
  Variant,
  ModifierGroup,
  ModifierOption,
  AvailabilityWindow,
  type MenuStatus,
} from "@/menu/domain";

/**
 * Persistence-shaped row DTOs. These mirror the Prisma model columns but are
 * declared as plain types so the mappers stay PURE and unit-testable without a
 * database or the generated Prisma client. The repository adapter assembles
 * these shapes from Prisma reads/writes.
 */

export interface AvailabilityColumns {
  availDays: number | null;
  availStart: number | null;
  availEnd: number | null;
}

export interface ModifierOptionRow {
  id: string;
  name: string;
  priceDelta: number;
  sortOrder: number;
}

export interface ModifierGroupRow {
  id: string;
  name: string;
  min: number;
  max: number;
  sortOrder: number;
  options: ModifierOptionRow[];
}

export interface VariantRow {
  id: string;
  label: string;
  price: number;
  sortOrder: number;
}

export interface ItemRow extends AvailabilityColumns {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  imageUrl: string | null;
  imagePath: string | null;
  active: boolean;
  sortOrder: number;
  allergenIds: string[];
  variants: VariantRow[];
  modifierGroups: ModifierGroupRow[];
}

export interface CategoryRow extends AvailabilityColumns {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  description: string | null;
  items: ItemRow[];
}

export interface MenuRow {
  id: string;
  name: string;
  slug: string;
  status: string;
  categories: CategoryRow[];
}

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6] as const;

/**
 * Pack an AvailabilityWindow into lean columns: a weekday bitmask (bit N set =>
 * weekday N is included) plus the inclusive start / exclusive end minute range.
 * No window => all-null columns meaning "always available".
 */
export function packAvailability(
  window: AvailabilityWindow | undefined,
): AvailabilityColumns {
  if (!window) {
    return { availDays: null, availStart: null, availEnd: null };
  }
  const mask = window.days.reduce((acc, day) => acc | (1 << day), 0);
  return {
    availDays: mask,
    availStart: window.startMinute,
    availEnd: window.endMinute,
  };
}

/**
 * Unpack availability columns back into a domain AvailabilityWindow. All-null
 * columns => undefined ("always available").
 */
export function unpackAvailability(
  availDays: number | null,
  availStart: number | null,
  availEnd: number | null,
): AvailabilityWindow | undefined {
  if (availDays === null || availStart === null || availEnd === null) {
    return undefined;
  }
  const days = WEEKDAYS.filter((day) => (availDays & (1 << day)) !== 0);
  return AvailabilityWindow.create({
    days,
    startMinute: availStart,
    endMinute: availEnd,
  });
}

function imageColumns(source: ImageSource): {
  imageUrl: string | null;
  imagePath: string | null;
} {
  if (source.type === IMAGE_SOURCE_TYPE.LOCAL) {
    return { imageUrl: null, imagePath: source.url };
  }
  if (source.type === IMAGE_SOURCE_TYPE.EXTERNAL) {
    return { imageUrl: source.url, imagePath: null };
  }
  return { imageUrl: null, imagePath: null };
}

export function toDomainItem(row: ItemRow): Item {
  return Item.create({
    id: row.id,
    name: row.name,
    slug: Slug.fromExisting(row.slug),
    description: row.description,
    basePrice: Price.create(row.basePrice),
    imageSource: ImageSource.resolve(row.imagePath, row.imageUrl),
    active: row.active,
    position: row.sortOrder,
    allergenIds: [...row.allergenIds],
    variants: row.variants.map(toDomainVariant),
    modifierGroups: row.modifierGroups.map(toDomainModifierGroup),
    availability: unpackAvailability(row.availDays, row.availStart, row.availEnd),
  });
}

function toDomainVariant(row: VariantRow): Variant {
  return Variant.create({
    id: row.id,
    label: row.label,
    price: Price.create(row.price),
    position: row.sortOrder,
  });
}

function toDomainModifierGroup(row: ModifierGroupRow): ModifierGroup {
  return ModifierGroup.create({
    id: row.id,
    name: row.name,
    min: row.min,
    max: row.max,
    position: row.sortOrder,
    options: row.options.map(toDomainModifierOption),
  });
}

function toDomainModifierOption(row: ModifierOptionRow): ModifierOption {
  return ModifierOption.create({
    id: row.id,
    name: row.name,
    priceDelta: Price.create(row.priceDelta),
  });
}

function toDomainCategory(row: CategoryRow): Category {
  return Category.create({
    id: row.id,
    name: row.name,
    slug: Slug.fromExisting(row.slug),
    position: row.sortOrder,
    items: row.items.map(toDomainItem),
    availability: unpackAvailability(row.availDays, row.availStart, row.availEnd),
  });
}

export function toDomainMenu(row: MenuRow): Menu {
  return Menu.create({
    id: row.id,
    name: row.name,
    slug: Slug.fromExisting(row.slug),
    status: row.status as MenuStatus,
    categories: row.categories.map(toDomainCategory),
  });
}

export function toPersistenceItem(item: Item): ItemRow {
  const image = imageColumns(item.imageSource);
  const availability = packAvailability(item.availability);
  return {
    id: item.id,
    name: item.name,
    slug: item.slug.value,
    description: item.description,
    basePrice: item.basePrice.value,
    imageUrl: image.imageUrl,
    imagePath: image.imagePath,
    active: item.active,
    sortOrder: item.position,
    allergenIds: [...item.allergenIds],
    variants: item.variants.map(toPersistenceVariant),
    modifierGroups: item.modifierGroups.map(toPersistenceModifierGroup),
    ...availability,
  };
}

function toPersistenceVariant(variant: Variant): VariantRow {
  return {
    id: variant.id,
    label: variant.label,
    price: variant.price.value,
    sortOrder: variant.position,
  };
}

function toPersistenceModifierGroup(group: ModifierGroup): ModifierGroupRow {
  return {
    id: group.id,
    name: group.name,
    min: group.min,
    max: group.max,
    sortOrder: group.position,
    options: group.options.map(toPersistenceModifierOption),
  };
}

function toPersistenceModifierOption(option: ModifierOption): ModifierOptionRow {
  return {
    id: option.id,
    name: option.name,
    priceDelta: option.priceDelta.value,
    sortOrder: 0,
  };
}

function toPersistenceCategory(category: Category): CategoryRow {
  const availability = packAvailability(category.availability);
  return {
    id: category.id,
    name: category.name,
    slug: category.slug.value,
    sortOrder: category.position,
    description: null,
    items: category.items.map(toPersistenceItem),
    ...availability,
  };
}

export function toPersistenceMenu(menu: Menu): MenuRow {
  return {
    id: menu.id,
    name: menu.name,
    slug: menu.slug.value,
    status: menu.status,
    categories: menu.categories.map(toPersistenceCategory),
  };
}
