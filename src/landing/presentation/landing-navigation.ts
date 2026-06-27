/** Slug for in-page section anchors (headings → `#feature-spanish-tapas`). */
export function landingSectionSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface LandingNavLink {
  readonly label: string;
  readonly href: string;
}

export interface LandingNavigationView {
  readonly restaurantName: string;
  readonly headerLinks: readonly LandingNavLink[];
  readonly footerMenuLinks: readonly LandingNavLink[];
  readonly footerPageLinks: readonly LandingNavLink[];
}

interface BuildLandingNavigationInput {
  readonly restaurantName: string;
  readonly aboutHeading: string | null;
  readonly highlightHeadings: readonly string[];
  readonly privateDiningHeading: string | null;
  readonly hoursHeading: string | null;
  readonly locationHeading: string | null;
  readonly contactHeading: string | null;
  readonly menuHref: string;
  readonly reserveHref: string;
}

/**
 * Builds header + footer navigation from the sections present on the landing.
 * Mirrors azaharpr.com: compact top nav and a footer grouped as Menu / Page.
 */
export function buildLandingNavigation(
  input: BuildLandingNavigationInput,
): LandingNavigationView {
  const footerPageLinks: LandingNavLink[] = [];

  if (input.aboutHeading) {
    footerPageLinks.push({ label: input.aboutHeading, href: "#about" });
  }

  for (const heading of input.highlightHeadings) {
    footerPageLinks.push({
      label: heading,
      href: `#feature-${landingSectionSlug(heading)}`,
    });
  }

  if (input.privateDiningHeading) {
    footerPageLinks.push({
      label: input.privateDiningHeading,
      href: "#private-dining",
    });
  }

  if (input.hoursHeading) {
    footerPageLinks.push({ label: input.hoursHeading, href: "#hours" });
  }

  if (input.locationHeading) {
    footerPageLinks.push({ label: input.locationHeading, href: "#location" });
  }

  if (input.contactHeading) {
    footerPageLinks.push({ label: input.contactHeading, href: "#contact" });
  }

  const headerLinks: LandingNavLink[] = [
    { label: "Carta", href: input.menuHref },
    ...(input.aboutHeading
      ? [{ label: "Nosotros", href: "#about" }]
      : []),
    ...(input.contactHeading
      ? [{ label: "Contacto", href: "#contact" }]
      : []),
    { label: "Reservaciones", href: input.reserveHref },
  ];

  return {
    restaurantName: input.restaurantName,
    headerLinks,
    footerMenuLinks: [{ label: "Ver carta", href: input.menuHref }],
    footerPageLinks,
  };
}

function findReserveHref(
  privateDiningCta: LandingNavLink | null,
  highlightCtas: readonly (LandingNavLink | null)[],
  fallback: string,
): string {
  if (privateDiningCta) {
    return privateDiningCta.href;
  }

  const reserveFromHighlight = highlightCtas.find(
    (cta) =>
      cta !== null &&
      /reserv/i.test(cta.label) &&
      !cta.href.startsWith("/menu"),
  );
  if (reserveFromHighlight) {
    return reserveFromHighlight.href;
  }

  return fallback;
}

/** Projects a {@link LandingViewModel} into header/footer navigation props. */
export function buildLandingNavigationFromViewModel(viewModel: {
  readonly hero: { readonly restaurantName: string };
  readonly about: { readonly heading: string } | null;
  readonly highlights: readonly {
    readonly heading: string;
    readonly cta: { readonly label: string; readonly href: string } | null;
  }[];
  readonly privateDining: {
    readonly heading: string;
    readonly cta: { readonly label: string; readonly href: string } | null;
  } | null;
  readonly hours: { readonly heading: string } | null;
  readonly location: { readonly heading: string } | null;
  readonly contact: { readonly heading: string } | null;
  readonly cta: { readonly label: string; readonly href: string };
}): LandingNavigationView {
  const reserveHref = findReserveHref(
    viewModel.privateDining?.cta ?? null,
    viewModel.highlights.map((h) => h.cta),
    viewModel.cta.href,
  );

  return buildLandingNavigation({
    restaurantName: viewModel.hero.restaurantName,
    aboutHeading: viewModel.about?.heading ?? null,
    highlightHeadings: viewModel.highlights.map((h) => h.heading),
    privateDiningHeading: viewModel.privateDining?.heading ?? null,
    hoursHeading: viewModel.hours?.heading ?? null,
    locationHeading: viewModel.location?.heading ?? null,
    contactHeading: viewModel.contact?.heading ?? null,
    menuHref: viewModel.cta.href,
    reserveHref,
  });
}

export function featureSectionId(heading: string): string {
  return `feature-${landingSectionSlug(heading)}`;
}
