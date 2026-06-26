import { createPriceFormatter } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { AvailabilityResolver } from "@/menu/domain";
import { PrismaMenuRepository } from "@/menu/infrastructure/persistence";
import { prisma } from "@/shared/infrastructure/prisma/client";
import { buildMenuViewModel, MenuPage } from "@/menu/presentation";
import type { Menu } from "@/menu/domain";

// Availability is resolved at request time, so the menu is rendered dynamically.
export const dynamic = "force-dynamic";

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
 * Public, read-only menu page (RSC). Fetches config (branding, formatter,
 * timezone) and the published menu, projects the domain aggregate into
 * presentation props with availability resolved at the current instant, then
 * renders the Azahar-style page. Display-only — no cart/checkout.
 */
export default async function PublicMenuPage() {
  const [config, menu] = await Promise.all([getConfig(), loadPublishedMenu()]);
  const formatPrice = createPriceFormatter({
    locale: config.locale,
    currency: config.currency,
    showSymbol: config.showCurrencySymbol,
  });

  if (!menu) {
    return (
      <MenuPage
        viewModel={{
          restaurantName: config.restaurantName,
          isEmpty: true,
          categories: [],
        }}
      />
    );
  }

  const viewModel = buildMenuViewModel(menu, {
    resolver,
    now: new Date(),
    timezone: config.timezone,
    formatPrice,
  });

  return <MenuPage viewModel={viewModel} />;
}
