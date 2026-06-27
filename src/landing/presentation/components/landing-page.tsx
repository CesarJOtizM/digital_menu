import { AboutSection } from "./about-section";
import { ContactSection } from "./contact-section";
import { FeatureSection } from "./feature-section";
import { HoursSection } from "./hours-section";
import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";
import { LandingHero } from "./landing-hero";
import { LocationSection } from "./location-section";
import { PrivateDiningSection } from "./private-dining-section";
import { LandingJsonLd } from "./landing-json-ld";
import { buildLandingNavigationFromViewModel } from "../landing-navigation";
import type { LandingViewModel } from "../landing-view-model";

interface LandingPageProps {
  readonly viewModel: LandingViewModel;
  readonly siteUrl: string;
}

/**
 * Azahar-style landing mirroring azaharpr.com: sticky header, hero with CTA,
 * welcome copy, feature sections, private dining, info grid, and sectioned footer.
 */
export function LandingPage({ viewModel, siteUrl }: LandingPageProps) {
  const hasInfoGrid =
    viewModel.hours !== null ||
    viewModel.location !== null ||
    viewModel.contact !== null;
  const navigation = buildLandingNavigationFromViewModel(viewModel);

  return (
    <div className="animate-menu-enter menu-surface min-h-screen">
      <LandingJsonLd viewModel={viewModel} siteUrl={siteUrl} />
      <LandingHeader navigation={navigation} />

      <main>
        <LandingHero hero={viewModel.hero} />

        {viewModel.about ? <AboutSection about={viewModel.about} /> : null}

        {viewModel.highlights.map((feature, index) => (
          <FeatureSection
            key={feature.heading}
            feature={feature}
            index={index}
            variant={index % 2 === 1 ? "muted" : "default"}
          />
        ))}

        {viewModel.privateDining ? (
          <PrivateDiningSection callout={viewModel.privateDining} />
        ) : null}

        {hasInfoGrid ? (
          <section className="border-y border-stone-200/80 bg-stone-50/50 px-6 py-16 sm:py-20">
            <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-3 md:gap-10">
              {viewModel.hours ? (
                <HoursSection hours={viewModel.hours} align="left" id="hours" />
              ) : null}
              {viewModel.location ? (
                <LocationSection
                  location={viewModel.location}
                  align="left"
                  id="location"
                />
              ) : null}
              {viewModel.contact ? (
                <ContactSection contact={viewModel.contact} id="contact" />
              ) : null}
            </div>
          </section>
        ) : null}
      </main>

      <LandingFooter navigation={navigation} social={viewModel.social} />
    </div>
  );
}
