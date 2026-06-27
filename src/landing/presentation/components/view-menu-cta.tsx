import Link from "next/link";
import type { LandingCtaView } from "../landing-view-model";

interface ViewMenuCTAProps {
  readonly cta: LandingCtaView;
}

/**
 * The single landing call to action: navigates to the public menu at `/menu`.
 * This is the ONLY action on the landing — display-only, no cart/checkout.
 */
export function ViewMenuCTA({ cta }: ViewMenuCTAProps) {
  return (
    <Link
      href={cta.href}
      className="menu-accent-bg inline-flex items-center justify-center rounded-full px-10 py-3.5 text-sm font-medium uppercase tracking-[0.2em] text-white shadow-sm transition-transform hover:-translate-y-0.5"
    >
      {cta.label}
    </Link>
  );
}
