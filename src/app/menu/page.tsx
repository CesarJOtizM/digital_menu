import type { Metadata } from "next";
import { buildSiteMetadata } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { getTranslations } from "@/i18n/server";
import { MenuView } from "./menu-view";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [config, { t }] = await Promise.all([getConfig(), getTranslations()]);
  return buildSiteMetadata(config, {
    title: t("menu.title"),
    description: t("menu.metaDescription", { restaurant: config.restaurantName }),
    path: "/menu",
  });
}

/**
 * The public menu is ALWAYS reachable here at `/menu`, regardless of whether the
 * deploy enables a landing page. Delegates to the shared {@link MenuView} RSC.
 */
export default function MenuRoutePage() {
  return <MenuView />;
}
