import { createPriceFormatter } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { AvailabilityResolver } from "@/menu/domain";
import { PrismaMenuRepository } from "@/menu/infrastructure/persistence";
import { loadAllergenNameMap } from "@/menu/infrastructure/persistence/load-allergens";
import { prisma } from "@/shared/infrastructure/prisma/client";
import { resolveRootView } from "@/landing/presentation";
import { buildMenuViewModel, MenuPage } from "@/menu/presentation";
import type { MenuUiLabels } from "@/menu/presentation";
import type { Menu } from "@/menu/domain";
import { getTranslations } from "@/i18n/server";

const resolver = new AvailabilityResolver();

async function loadPublishedMenu(): Promise<Menu | null> {
  try {
    const repository = new PrismaMenuRepository(prisma);
    return await repository.findPublished();
  } catch {
    return null;
  }
}

export async function MenuView() {
  const [config, menu, allergenNames, { t }] = await Promise.all([
    getConfig(),
    loadPublishedMenu(),
    loadAllergenNameMap(),
    getTranslations(),
  ]);

  const formatPrice = createPriceFormatter({
    locale: config.locale,
    currency: config.currency,
    showSymbol: config.showCurrencySymbol,
  });

  const labels: MenuUiLabels = {
    subtitle: t("menu.subtitle"),
    emptyTitle: t("menu.emptyTitle"),
    emptyBody: t("menu.emptyBody"),
    categoryNavAria: t("menu.categoryNavAria"),
    unavailable: t("menu.unavailable"),
    home: t("common.home"),
    viewToggleAria: t("menu.viewToggleAria"),
    listView: t("menu.listView"),
    cardsView: t("menu.cardsView"),
  };

  const homeLink =
    resolveRootView(config) === "landing"
      ? { label: labels.home, href: "/" }
      : null;

  if (!menu) {
    return (
      <MenuPage
        viewModel={{
          restaurantName: config.restaurantName,
          isEmpty: true,
          categories: [],
          homeLink,
        }}
        labels={labels}
      />
    );
  }

  const viewModel = buildMenuViewModel(menu, {
    resolver,
    now: new Date(),
    timezone: config.timezone,
    formatPrice,
    allergenNames,
  });

  return <MenuPage viewModel={{ ...viewModel, homeLink }} labels={labels} />;
}
