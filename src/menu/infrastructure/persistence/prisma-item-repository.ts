import "server-only";

import type { PrismaClient } from "@prisma/client";
import type { Item } from "@/menu/domain";
import type { ItemRepository } from "@/menu/application/ports/item-repository";
import { toDomainItem } from "./prisma-mappers";
import { itemInclude, prismaItemToRow, saveItemTree } from "./prisma-write";

/**
 * Prisma adapter implementing the item-scoped ItemRepository port (used by the
 * copy-modifiers use-case). An Item is a child of the Menu aggregate; this
 * adapter loads/saves a single item subtree by id while keeping it within its
 * existing category. Single-tenant: no brand/tenant filter.
 */
export class PrismaItemRepository implements ItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Item | null> {
    const item = await this.prisma.item.findUnique({ where: { id }, include: itemInclude });
    return item ? toDomainItem(prismaItemToRow(item)) : null;
  }

  async save(item: Item): Promise<void> {
    const existing = await this.prisma.item.findUnique({
      where: { id: item.id },
      select: { categoryId: true },
    });
    if (!existing) {
      throw new Error(`Cannot save item "${item.id}": item does not exist`);
    }
    await this.prisma.$transaction(async (tx) => {
      await saveItemTree(tx, existing.categoryId, item);
    });
  }
}
