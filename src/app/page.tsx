import type { Metadata } from "next";
import { getConfig } from "@/config/infrastructure";
import { buildSiteMetadata } from "@/config/domain";
import {
  buildLandingViewModel,
  LandingPage,
  resolveRootView,
} from "@/landing/presentation";
import { MenuChrome } from "./menu/menu-chrome";
import { MenuView } from "./menu/menu-view";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildSiteMetadata(config, { path: "/" });
}

/**
 * Root route `/` resolver (Option A). Decides by config:
 * - `landingEnabled === true` → renders the Azahar-style LANDING here at `/`.
 * - otherwise                 → renders the MENU here at `/`.
 *
 * The MENU is ALSO always reachable at `/menu`. The decision is the pure
 * {@link resolveRootView} function, so `/` shows the right view with no redirect
 * hop. Display-only — no cart/checkout on either branch.
 */
export default async function RootPage() {
  const config = await getConfig();

  if (resolveRootView(config) === "landing") {
    const viewModel = buildLandingViewModel(
      { restaurantName: config.restaurantName, logo: config.logo },
      config.landing,
    );
    return <LandingPage viewModel={viewModel} siteUrl={process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"} />;
  }

  return (
    <MenuChrome>
      <MenuView />
    </MenuChrome>
  );
}
