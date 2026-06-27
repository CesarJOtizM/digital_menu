import type { Metadata } from "next";
import { buildSiteMetadata } from "@/config/domain";
import { getConfig } from "@/config/infrastructure";
import { MenuView } from "./menu-view";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfig();
  return buildSiteMetadata(config, {
    title: "Carta",
    description: `Explora la carta de ${config.restaurantName} — platos, precios y disponibilidad al instante.`,
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
