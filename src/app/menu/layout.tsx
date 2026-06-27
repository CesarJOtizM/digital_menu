import type { ReactNode } from "react";
import { MenuChrome } from "./menu-chrome";

/**
 * Layout for the `/menu` route. Wraps the menu in the shared {@link MenuChrome}
 * (themed cream surface + dark Azahar footer). Single-tenant: one deploy, one
 * config.
 */
export default function MenuLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <MenuChrome>{children}</MenuChrome>;
}
