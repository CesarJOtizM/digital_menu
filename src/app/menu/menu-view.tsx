import { createPriceFormatter } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { AvailabilityResolver } from "@/menu/domain";
import { PrismaMenuRepository } from "@/menu/infrastructure/persistence";
import { loadAllergenNameMap } from "@/menu/infrastructure/persistence/load-allergens";
import { prisma } from "@/shared/infrastructure/prisma/client";
import { resolveRootView } from "@/landing/presentation";
import { buildMenuViewModel, MenuPage } from "@/menu/presentation";
import type { HomeLinkView } from "@/menu/presentation";
import type { Menu } from "@/menu/domain";

const HOME_LINK: HomeLinkView = { label: "Inicio", href: "/" };

const resolver = new AvailabilityResolver();

/**
 * Loads the single published menu. Degrades to `null` if the store is
 * unreachable (e.g. no DB during build/preview) so the page renders the empty
 * state instead of crashing — mirrors the config safe-load contract.
 */
async function loadPublishedMenu(): Promise<Menu | null> {
  try {
    // The public read-only page reads only the Menu aggregate. It constructs the
    // repository directly rather than the full DI container so the write-side
    // image storage (sharp + fs) never gets pulled into this RSC's module graph.
    const repository = new PrismaMenuRepository(prisma);
    return await repository.findPublished();
  } catch {
    return null;
  }
}

/**
 * Renders the public, read-only Azahar-style menu (RSC). Fetches config
 * (branding, formatter, timezone) and the published menu, projects the domain
 * aggregate into presentation props with availability resolved at the current
 * instant. Shared by `/menu` (always) and `/` (when the landing is disabled), so
 * the menu renders at both with no redirect hop. Display-only — no cart/checkout.
 */
export async function MenuView() {
  const [config, menu, allergenNames] = await Promise.all([
    getConfig(),
    loadPublishedMenu(),
    loadAllergenNameMap(),
  ]);
  const formatPrice = createPriceFormatter({
    locale: config.locale,
    currency: config.currency,
    showSymbol: config.showCurrencySymbol,
  });
  const homeLink = resolveRootView(config) === "landing" ? HOME_LINK : null;

  if (!menu) {
    return (
      <MenuPage
        viewModel={{
          restaurantName: config.restaurantName,
          isEmpty: true,
          categories: [],
          homeLink,
        }}
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

  return <MenuPage viewModel={{ ...viewModel, homeLink }} />;
}
