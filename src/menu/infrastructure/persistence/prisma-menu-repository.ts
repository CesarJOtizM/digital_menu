import "server-only";

import type { PrismaClient } from "@prisma/client";
import type { Menu } from "@/menu/domain";
import type { MenuRepository } from "@/menu/application/ports/menu-repository";
import { prismaMenuToRow, type PrismaMenuWithRelations } from "./prisma-row";
import { toDomainMenu, packAvailability } from "./prisma-mappers";
import { menuInclude, saveItemTree } from "./prisma-write";

/**
 * Prisma adapter for the Menu aggregate (aggregate-level MenuRepository).
 * Single-tenant: no brand/tenant filter anywhere.
 *
 * Aggregate writes happen inside a single transaction so the Menu consistency
 * boundary (categories + items + variants + modifiers) is persisted atomically.
 * Removed children are pruned (cascade deletes clear their subtrees).
 */
export class PrismaMenuRepository implements MenuRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Menu | null> {
    const menu = await this.prisma.menu.findUnique({ where: { id }, include: menuInclude });
    return menu ? toDomainMenu(prismaMenuToRow(menu as PrismaMenuWithRelations)) : null;
  }

  async findBySlug(slug: string): Promise<Menu | null> {
    const menu = await this.prisma.menu.findUnique({ where: { slug }, include: menuInclude });
    return menu ? toDomainMenu(prismaMenuToRow(menu as PrismaMenuWithRelations)) : null;
  }

  async findPublished(): Promise<Menu | null> {
    const menu = await this.prisma.menu.findFirst({
      where: { status: "published" },
      orderBy: { updatedAt: "desc" },
      include: menuInclude,
    });
    return menu ? toDomainMenu(prismaMenuToRow(menu as PrismaMenuWithRelations)) : null;
  }

  async findForAdmin(): Promise<Menu | null> {
    const published = await this.findPublished();
    if (published) return published;

    const menu = await this.prisma.menu.findFirst({
      orderBy: { updatedAt: "desc" },
      include: menuInclude,
    });
    return menu ? toDomainMenu(prismaMenuToRow(menu as PrismaMenuWithRelations)) : null;
  }

  async save(menu: Menu): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.menu.upsert({
        where: { id: menu.id },
        create: { id: menu.id, name: menu.name, slug: menu.slug.value, status: menu.status },
        update: { name: menu.name, slug: menu.slug.value, status: menu.status },
      });

      const keepCategoryIds = menu.categories.map((category) => category.id);
      await tx.category.deleteMany({
        where: { menuId: menu.id, id: { notIn: keepCategoryIds } },
      });

      for (const category of menu.categories) {
        const availability = packAvailability(category.availability);
        await tx.category.upsert({
          where: { id: category.id },
          create: {
            id: category.id,
            menuId: menu.id,
            name: category.name,
            slug: category.slug.value,
            sortOrder: category.position,
            ...availability,
          },
          update: {
            name: category.name,
            slug: category.slug.value,
            sortOrder: category.position,
            ...availability,
          },
        });

        const keepItemIds = category.items.map((item) => item.id);
        await tx.item.deleteMany({
          where: { categoryId: category.id, id: { notIn: keepItemIds } },
        });

        for (const item of category.items) {
          await saveItemTree(tx, category.id, item);
        }
      }
    });
  }
}
