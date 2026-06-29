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
import {
  buildLandingNavigationFromViewModel,
  type LandingNavLabels,
} from "../landing-navigation";
import type { LandingViewModel } from "../landing-view-model";
import { getTranslations } from "@/i18n/server";

interface LandingPageLabels {
  readonly nav: LandingNavLabels;
  readonly footerMenu: string;
  readonly footerPage: string;
  readonly followUs: string;
  readonly copyright: string;
  readonly mainNavAria: string;
  readonly socialLinksAria: string;
  readonly mapTitle: (address: string) => string;
  readonly openInMaps: string;
}

interface LandingPageContentProps {
  readonly viewModel: LandingViewModel;
  readonly siteUrl: string;
  readonly labels: LandingPageLabels;
  readonly showLanguageSwitcher?: boolean;
}

export function LandingPageContent({
  viewModel,
  siteUrl,
  labels,
  showLanguageSwitcher = false,
}: LandingPageContentProps) {
  const hasInfoGrid =
    viewModel.hours !== null ||
    viewModel.location !== null ||
    viewModel.contact !== null;
  const navigation = buildLandingNavigationFromViewModel(viewModel, labels.nav);

  return (
    <div className="animate-menu-enter menu-surface min-h-screen">
      <LandingJsonLd viewModel={viewModel} siteUrl={siteUrl} />
      <LandingHeader
        navigation={navigation}
        mainNavAria={labels.mainNavAria}
        showLanguageSwitcher={showLanguageSwitcher}
      />

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
                  mapTitle={labels.mapTitle(viewModel.location.address)}
                  openInMapsLabel={labels.openInMaps}
                />
              ) : null}
              {viewModel.contact ? (
                <ContactSection contact={viewModel.contact} id="contact" />
              ) : null}
            </div>
          </section>
        ) : null}
      </main>

      <LandingFooter
        navigation={navigation}
        social={viewModel.social}
        labels={{
          menu: labels.footerMenu,
          page: labels.footerPage,
          followUs: labels.followUs,
          copyright: labels.copyright,
        }}
        socialLinksAria={labels.socialLinksAria}
      />
    </div>
  );
}

interface LandingPageProps {
  readonly viewModel: LandingViewModel;
  readonly siteUrl: string;
}

export async function LandingPage({ viewModel, siteUrl }: LandingPageProps) {
  const { t } = await getTranslations();

  return (
    <LandingPageContent
      viewModel={viewModel}
      siteUrl={siteUrl}
      showLanguageSwitcher
      labels={{
        nav: {
          menu: t("landing.menu"),
          about: t("landing.about"),
          contact: t("landing.contact"),
          reservations: t("landing.reservations"),
          viewMenu: t("landing.viewMenu"),
        },
        footerMenu: t("landing.footerMenu"),
        footerPage: t("landing.footerPage"),
        followUs: t("landing.followUs"),
        copyright: t("landing.copyright", { year: new Date().getFullYear() }),
        mainNavAria: t("landing.mainNavAria"),
        socialLinksAria: t("landing.socialLinksAria"),
        mapTitle: (address) => t("landing.mapTitle", { address }),
        openInMaps: t("landing.openInMaps"),
      }}
    />
  );
}
