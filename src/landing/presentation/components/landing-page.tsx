import { AboutSection } from "./about-section";
import { HoursSection } from "./hours-section";
import { LandingHero } from "./landing-hero";
import { LocationSection } from "./location-section";
import { SocialLinks } from "./social-links";
import { ViewMenuCTA } from "./view-menu-cta";
import type { LandingViewModel } from "../landing-view-model";

interface LandingPageProps {
  readonly viewModel: LandingViewModel;
}

/**
 * The optional, config-driven Azahar-style landing. Composes the hero with the
 * configured editorial sections (about / hours / location / social), each
 * omitted when absent, and a single CTA that links to the public menu. The menu
 * is also always reachable directly at `/menu`. Display-only — no cart/checkout.
 */
export function LandingPage({ viewModel }: LandingPageProps) {
  return (
    <main className="animate-menu-enter menu-surface min-h-screen">
      <LandingHero hero={viewModel.hero} />

      {viewModel.about ? <AboutSection about={viewModel.about} /> : null}
      {viewModel.hours ? <HoursSection hours={viewModel.hours} /> : null}
      {viewModel.location ? (
        <LocationSection location={viewModel.location} />
      ) : null}

      <section className="mx-auto flex max-w-2xl flex-col items-center gap-10 px-6 py-20">
        <ViewMenuCTA cta={viewModel.cta} />
        <SocialLinks links={viewModel.social} />
      </section>
    </main>
  );
}
