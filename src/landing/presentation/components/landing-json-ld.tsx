import type { LandingViewModel } from "../landing-view-model";

interface LandingJsonLdProps {
  readonly viewModel: LandingViewModel;
  readonly siteUrl: string;
}

/**
 * Restaurant JSON-LD for search engines — derived from the landing view model.
 */
export function LandingJsonLd({ viewModel, siteUrl }: LandingJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: viewModel.hero.restaurantName,
    description: viewModel.hero.description,
    url: siteUrl,
    image: viewModel.hero.imageUrls[0] ?? undefined,
    telephone: viewModel.contact?.phone ?? undefined,
    email: viewModel.contact?.email ?? undefined,
    address: viewModel.location
      ? {
          "@type": "PostalAddress",
          streetAddress: viewModel.location.address,
          addressLocality: "San Juan",
          addressRegion: "PR",
          addressCountry: "PR",
        }
      : undefined,
    servesCuisine: ["Spanish", "Puerto Rican", "Tapas"],
    menu: `${siteUrl}/menu`,
    sameAs: viewModel.social.map((link) => link.url),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
