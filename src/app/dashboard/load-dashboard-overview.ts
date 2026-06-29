import type { UiLocale } from "@/i18n/config";
import { getUiLocale } from "@/i18n/get-locale";
import { localizedName } from "@/menu/presentation/localize-menu-content";
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

function summarizeMenu(menu: Menu, locale: UiLocale): DashboardOverview["menu"] {
  const categories = menu.categories.map((category) => ({
    name: localizedName(category, locale),
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
  const [config, menu, locale] = await Promise.all([
    getConfig(),
    loadPublishedMenu(),
    getUiLocale(),
  ]);

  return {
    restaurantName: config.restaurantName,
    landingEnabled: config.landingEnabled,
    menu: menu ? summarizeMenu(menu, locale) : null,
  };
}
