import { MenuView } from "./menu-view";

// Availability is resolved at request time, so the menu is rendered dynamically.
export const dynamic = "force-dynamic";

/**
 * The public menu is ALWAYS reachable here at `/menu`, regardless of whether the
 * deploy enables a landing page. Delegates to the shared {@link MenuView} RSC.
 */
export default function MenuRoutePage() {
  return <MenuView />;
}
