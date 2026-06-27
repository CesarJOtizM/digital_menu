import type { Menu } from "@/menu/domain";
import { PrismaMenuRepository } from "@/menu/infrastructure/persistence";
import { getConfig } from "@/config/infrastructure";
import { prisma } from "@/shared/infrastructure/prisma/client";

export interface DashboardCategorySummary {
  name: string;
  itemCount: number;
}

export interface DashboardOverview {
  restaurantName: string;
  landingEnabled: boolean;
  menu: {
    name: string;
    status: string;
    categoryCount: number;
    itemCount: number;
    categories: DashboardCategorySummary[];
  } | null;
}

function summarizeMenu(menu: Menu): DashboardOverview["menu"] {
  const categories = menu.categories.map((category) => ({
    name: category.name,
    itemCount: category.items.length,
  }));

  const itemCount = categories.reduce(
    (total, category) => total + category.itemCount,
    0,
  );

  return {
    name: menu.name,
    status: menu.status,
    categoryCount: categories.length,
    itemCount,
    categories,
  };
}

async function loadPublishedMenu(): Promise<Menu | null> {
  try {
    const repository = new PrismaMenuRepository(prisma);
    return await repository.findPublished();
  } catch {
    return null;
  }
}

export async function loadDashboardOverview(): Promise<DashboardOverview> {
  const [config, menu] = await Promise.all([getConfig(), loadPublishedMenu()]);

  return {
    restaurantName: config.restaurantName,
    landingEnabled: config.landingEnabled,
    menu: menu ? summarizeMenu(menu) : null,
  };
}
