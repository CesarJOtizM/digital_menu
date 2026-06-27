/**
 * Pure projection of per-deploy branding + the optional `landing` JSON blob into
 * Azahar-style landing sections. The blob comes from the Settings `landing` JSON
 * column (typed `unknown`), so every read is defensive and degrades to a
 * branding-derived default. No I/O, no clock — everything is injected.
 */

/** Minimal branding slice the landing needs (from DeployConfig). */
export interface LandingBranding {
  readonly restaurantName: string;
  readonly logo: string | null;
}

/** Hero band: restaurant name over an optional image, with an optional tagline. */
export interface LandingHeroView {
  readonly restaurantName: string;
  readonly imageUrl: string | null;
  readonly tagline: string | null;
  readonly logoUrl: string | null;
}

/** About band: an optional heading and one or more paragraphs. */
export interface LandingAboutView {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

/** A single opening-hours row. */
export interface LandingHoursRow {
  readonly day: string;
  readonly hours: string;
}

/** Hours band: a heading and ordered day/hours rows. */
export interface LandingHoursView {
  readonly heading: string;
  readonly rows: readonly LandingHoursRow[];
}

/** Location band: a required address with an optional map link. */
export interface LandingLocationView {
  readonly heading: string;
  readonly address: string;
  readonly mapUrl: string | null;
}

/** A single social link. */
export interface LandingSocialLink {
  readonly label: string;
  readonly url: string;
}

/** The "view the menu" call to action — always targets `/menu`. */
export interface LandingCtaView {
  readonly label: string;
  readonly href: string;
}

/** The whole landing page shaped for rendering. */
export interface LandingViewModel {
  readonly hero: LandingHeroView;
  readonly about: LandingAboutView | null;
  readonly hours: LandingHoursView | null;
  readonly location: LandingLocationView | null;
  readonly social: readonly LandingSocialLink[];
  readonly cta: LandingCtaView;
}

const MENU_HREF = "/menu";
const DEFAULT_CTA_LABEL = "View Menu";
const DEFAULT_ABOUT_HEADING = "About";
const DEFAULT_HOURS_HEADING = "Hours";
const DEFAULT_LOCATION_HEADING = "Find Us";

type Json = Record<string, unknown>;

function asObject(value: unknown): Json {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Json)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function buildHero(branding: LandingBranding, blob: Json): LandingHeroView {
  const hero = asObject(blob.hero);
  return {
    restaurantName: branding.restaurantName,
    logoUrl: branding.logo,
    imageUrl: asString(hero.image),
    tagline: asString(hero.tagline),
  };
}

function buildAbout(blob: Json): LandingAboutView | null {
  const about = asObject(blob.about);
  const rawBody = about.body;
  let paragraphs: string[] = [];

  if (typeof rawBody === "string") {
    const single = asString(rawBody);
    paragraphs = single ? [single] : [];
  } else if (Array.isArray(rawBody)) {
    paragraphs = rawBody
      .map(asString)
      .filter((p): p is string => p !== null);
  }

  if (paragraphs.length === 0) {
    return null;
  }

  return {
    heading: asString(about.heading) ?? DEFAULT_ABOUT_HEADING,
    paragraphs,
  };
}

function buildHours(blob: Json): LandingHoursView | null {
  const hours = asObject(blob.hours);
  const schedule = Array.isArray(hours.schedule) ? hours.schedule : [];

  const rows = schedule
    .map((entry): LandingHoursRow | null => {
      const row = asObject(entry);
      const day = asString(row.day);
      const value = asString(row.hours);
      return day && value ? { day, hours: value } : null;
    })
    .filter((row): row is LandingHoursRow => row !== null);

  if (rows.length === 0) {
    return null;
  }

  return {
    heading: asString(hours.heading) ?? DEFAULT_HOURS_HEADING,
    rows,
  };
}

function buildLocation(blob: Json): LandingLocationView | null {
  const location = asObject(blob.location);
  const address = asString(location.address);

  if (!address) {
    return null;
  }

  return {
    heading: asString(location.heading) ?? DEFAULT_LOCATION_HEADING,
    address,
    mapUrl: asString(location.mapUrl),
  };
}

function buildSocial(blob: Json): LandingSocialLink[] {
  const social = Array.isArray(blob.social) ? blob.social : [];
  return social
    .map((entry): LandingSocialLink | null => {
      const link = asObject(entry);
      const label = asString(link.label);
      const url = asString(link.url);
      return label && url ? { label, url } : null;
    })
    .filter((link): link is LandingSocialLink => link !== null);
}

function buildCta(blob: Json): LandingCtaView {
  const cta = asObject(blob.cta);
  return {
    label: asString(cta.label) ?? DEFAULT_CTA_LABEL,
    href: MENU_HREF,
  };
}

/**
 * Builds the {@link LandingViewModel} from branding and the raw `landing` blob.
 * Sections with no usable content are `null` so the page can omit them; the hero
 * and CTA always render (the CTA always points at the menu).
 */
export function buildLandingViewModel(
  branding: LandingBranding,
  landingRaw: unknown,
): LandingViewModel {
  const blob = asObject(landingRaw);
  return {
    hero: buildHero(branding, blob),
    about: buildAbout(blob),
    hours: buildHours(blob),
    location: buildLocation(blob),
    social: buildSocial(blob),
    cta: buildCta(blob),
  };
}
