import "server-only";

import type { PrismaClient } from "@prisma/client";
import type { Item } from "@/menu/domain";
import { toPersistenceItem, type ItemRow } from "./prisma-mappers";

/** A Prisma interactive-transaction client (the `tx` passed to $transaction). */
export type PrismaTransaction = Parameters<
  Parameters<PrismaClient["$transaction"]>[0]
>[0];

/** Prisma include used to read a full Item subtree. */
export const itemInclude = {
  allergens: true,
  variants: { orderBy: { sortOrder: "asc" } },
  modifierGroups: {
    orderBy: { sortOrder: "asc" },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  },
} as const;

/** Prisma include used to read a full Menu aggregate subtree. */
export const menuInclude = {
  categories: {
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" }, include: itemInclude } },
  },
} as const;

export interface PrismaItemReadShape {
  id: string;
  name: string;
  nameEn: string | null;
  slug: string;
  description: string;
  descriptionEn: string | null;
  basePrice: number;
  imageUrl: string | null;
  imagePath: string | null;
  active: boolean;
  sortOrder: number;
  availDays: number | null;
  availStart: number | null;
  availEnd: number | null;
  allergens: { allergenId: string }[];
  variants: { id: string; label: string; labelEn: string | null; price: number; sortOrder: number }[];
  modifierGroups: {
    id: string;
    name: string;
    nameEn: string | null;
    min: number;
    max: number;
    sortOrder: number;
    options: { id: string; name: string; nameEn: string | null; priceDelta: number; sortOrder: number }[];
  }[];
}

/** Project a single Prisma item read into a mapper ItemRow. */
export function prismaItemToRow(item: PrismaItemReadShape): ItemRow {
  return {
    id: item.id,
    name: item.name,
    nameEn: item.nameEn,
    slug: item.slug,
    description: item.description,
    descriptionEn: item.descriptionEn,
    basePrice: item.basePrice,
    imageUrl: item.imageUrl,
    imagePath: item.imagePath,
    active: item.active,
    sortOrder: item.sortOrder,
    availDays: item.availDays,
    availStart: item.availStart,
    availEnd: item.availEnd,
    allergenIds: item.allergens.map((link) => link.allergenId),
    variants: item.variants.map((v) => ({
      id: v.id,
      label: v.label,
      labelEn: v.labelEn,
      price: v.price,
      sortOrder: v.sortOrder,
    })),
    modifierGroups: item.modifierGroups.map((g) => ({
      id: g.id,
      name: g.name,
      nameEn: g.nameEn,
      min: g.min,
      max: g.max,
      sortOrder: g.sortOrder,
      options: g.options.map((o) => ({
        id: o.id,
        name: o.name,
        nameEn: o.nameEn,
        priceDelta: o.priceDelta,
        sortOrder: o.sortOrder,
      })),
    })),
  };
}

/**
 * Persist a full Item subtree (item row + variants + modifier groups/options +
 * allergen links) within an existing transaction, replacing child sets so the
 * stored tree exactly matches the domain Item.
 */
export async function saveItemTree(
  tx: PrismaTransaction,
  categoryId: string,
  item: Item,
): Promise<void> {
  const row = toPersistenceItem(item);

  await tx.item.upsert({
    where: { id: row.id },
    create: {
      id: row.id,
      categoryId,
      name: row.name,
      nameEn: row.nameEn,
      slug: row.slug,
      description: row.description,
      descriptionEn: row.descriptionEn,
      basePrice: row.basePrice,
      imageUrl: row.imageUrl,
      imagePath: row.imagePath,
      active: row.active,
      sortOrder: row.sortOrder,
      availDays: row.availDays,
      availStart: row.availStart,
      availEnd: row.availEnd,
    },
    update: {
      name: row.name,
      nameEn: row.nameEn,
      slug: row.slug,
      description: row.description,
      descriptionEn: row.descriptionEn,
      basePrice: row.basePrice,
      imageUrl: row.imageUrl,
      imagePath: row.imagePath,
      active: row.active,
      sortOrder: row.sortOrder,
      availDays: row.availDays,
      availStart: row.availStart,
      availEnd: row.availEnd,
    },
  });

  await tx.variant.deleteMany({
    where: { itemId: row.id, id: { notIn: row.variants.map((v) => v.id) } },
  });
  for (const variant of row.variants) {
    await tx.variant.upsert({
      where: { id: variant.id },
      create: {
        id: variant.id,
        itemId: row.id,
        label: variant.label,
        labelEn: variant.labelEn,
        price: variant.price,
        sortOrder: variant.sortOrder,
      },
      update: {
        label: variant.label,
        labelEn: variant.labelEn,
        price: variant.price,
        sortOrder: variant.sortOrder,
      },
    });
  }

  await tx.modifierGroup.deleteMany({
    where: { itemId: row.id, id: { notIn: row.modifierGroups.map((g) => g.id) } },
  });
  for (const group of row.modifierGroups) {
    await tx.modifierGroup.upsert({
      where: { id: group.id },
      create: {
        id: group.id,
        itemId: row.id,
        name: group.name,
        nameEn: group.nameEn,
        min: group.min,
        max: group.max,
        sortOrder: group.sortOrder,
      },
      update: {
        name: group.name,
        nameEn: group.nameEn,
        min: group.min,
        max: group.max,
        sortOrder: group.sortOrder,
      },
    });
    await tx.modifierOption.deleteMany({
      where: { groupId: group.id, id: { notIn: group.options.map((o) => o.id) } },
    });
    for (const option of group.options) {
      await tx.modifierOption.upsert({
        where: { id: option.id },
        create: {
          id: option.id,
          groupId: group.id,
          name: option.name,
          nameEn: option.nameEn,
          priceDelta: option.priceDelta,
          sortOrder: option.sortOrder,
        },
        update: {
          name: option.name,
          nameEn: option.nameEn,
          priceDelta: option.priceDelta,
          sortOrder: option.sortOrder,
        },
      });
    }
  }

  await tx.itemAllergen.deleteMany({
    where: { itemId: row.id, allergenId: { notIn: row.allergenIds } },
  });
  for (const allergenId of row.allergenIds) {
    await tx.itemAllergen.upsert({
      where: { itemId_allergenId: { itemId: row.id, allergenId } },
      create: { itemId: row.id, allergenId },
      update: {},
    });
  }
}
