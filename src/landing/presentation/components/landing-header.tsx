import Link from "next/link";
import { LanguageSwitcher } from "@/i18n";
import type { LandingNavigationView } from "../landing-navigation";
import { LandingNavLinkItem } from "./landing-nav-link";

interface LandingHeaderProps {
  readonly navigation: LandingNavigationView;
  readonly mainNavAria: string;
  readonly showLanguageSwitcher?: boolean;
}

/**
 * Compact sticky header — brand, nav links and optional locale switcher on one row.
 */
export function LandingHeader({
  navigation,
  mainNavAria,
  showLanguageSwitcher = false,
}: LandingHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-4 sm:flex-row sm:justify-between">
        <Link
          href="/"
          className="font-heading text-xl font-medium tracking-wide text-stone-800 transition-colors hover:text-stone-600"
        >
          {navigation.restaurantName}
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:justify-end">
          <nav aria-label={mainNavAria} className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {navigation.headerLinks.map((link) => (
              <LandingNavLinkItem key={`${link.href}-${link.label}`} link={link} />
            ))}
          </nav>
          {showLanguageSwitcher ? <LanguageSwitcher /> : null}
        </div>
      </div>
    </header>
  );
}
