/**
 * Pure projection of per-deploy branding + the optional `landing` JSON blob into
 * Azahar-style landing sections. The blob comes from the Settings `landing` JSON
 * column (typed `unknown`), so every read is defensive and degrades to a
 * branding-derived default. No I/O, no clock — everything is injected.
 */

import { buildGoogleMapsEmbedUrl } from "./maps-embed";

/** Minimal branding slice the landing needs (from DeployConfig). */
export interface LandingBranding {
  readonly restaurantName: string;
  readonly logo: string | null;
}

/** Hero band: headline, description, optional slides, and primary CTA. */
export interface LandingHeroView {
  readonly restaurantName: string;
  readonly headline: string;
  readonly description: string | null;
  readonly imageUrls: readonly string[];
  readonly logoUrl: string | null;
  readonly cta: LandingCtaView;
}

/** About / welcome band: heading and one or more paragraphs. */
export interface LandingAboutView {
  readonly heading: string;
  readonly paragraphs: readonly string[];
}

/** Editorial feature block (tapas, cocktails, chef, etc.). */
export interface LandingFeatureView {
  readonly heading: string;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly imageAlt: string | null;
  readonly cta: LandingCtaView | null;
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

/** Location band: address with embedded map and optional external link. */
export interface LandingLocationView {
  readonly heading: string;
  readonly address: string;
  readonly mapEmbedUrl: string;
  readonly mapUrl: string | null;
}

/** Contact details shown beside hours and location. */
export interface LandingContactView {
  readonly heading: string;
  readonly phone: string | null;
  readonly email: string | null;
}

/** Full-width callout (private dining, events). */
export interface LandingCalloutView {
  readonly heading: string;
  readonly body: string;
  readonly imageUrl: string | null;
  readonly imageAlt: string | null;
  readonly cta: LandingCtaView | null;
}

/** A single social link. */
export interface LandingSocialLink {
  readonly label: string;
  readonly url: string;
}

/** Landing call to action — internal route or external link. */
export interface LandingCtaView {
  readonly label: string;
  readonly href: string;
}

/** The whole landing page shaped for rendering. */
export interface LandingViewModel {
  readonly hero: LandingHeroView;
  readonly about: LandingAboutView | null;
  readonly highlights: readonly LandingFeatureView[];
  readonly hours: LandingHoursView | null;
  readonly location: LandingLocationView | null;
  readonly contact: LandingContactView | null;
  readonly privateDining: LandingCalloutView | null;
  readonly social: readonly LandingSocialLink[];
  /** Default menu CTA — also used as hero fallback. */
  readonly cta: LandingCtaView;
}

const MENU_HREF = "/menu";
const DEFAULT_CTA_LABEL = "Ver carta";
const DEFAULT_ABOUT_HEADING = "Nosotros";
const DEFAULT_HOURS_HEADING = "Horario";
const DEFAULT_LOCATION_HEADING = "Ubicación";
const DEFAULT_CONTACT_HEADING = "Contacto";

type Json = Record<string, unknown>;

function asObject(value: unknown): Json {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Json)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function buildCta(raw: unknown, fallbackHref = MENU_HREF): LandingCtaView {
  const cta = asObject(raw);
  return {
    label: asString(cta.label) ?? DEFAULT_CTA_LABEL,
    href: asString(cta.href) ?? fallbackHref,
  };
}

function buildOptionalCta(raw: unknown): LandingCtaView | null {
  const cta = asObject(raw);
  const label = asString(cta.label);
  if (!label) {
    return null;
  }
  return {
    label,
    href: asString(cta.href) ?? MENU_HREF,
  };
}

function buildImageFields(
  block: Json,
): { imageUrl: string | null; imageAlt: string | null } {
  return {
    imageUrl: asString(block.image) ?? asString(block.imageUrl),
    imageAlt: asString(block.imageAlt) ?? asString(block.alt),
  };
}

function buildHeroImages(hero: Json): string[] {
  if (Array.isArray(hero.images)) {
    const urls = hero.images
      .map(asString)
      .filter((url): url is string => url !== null);
    if (urls.length > 0) {
      return urls;
    }
  }

  const single = asString(hero.image);
  return single ? [single] : [];
}

function buildHero(
  branding: LandingBranding,
  blob: Json,
  defaultCta: LandingCtaView,
): LandingHeroView {
  const hero = asObject(blob.hero);
  const headline =
    asString(hero.headline) ??
    asString(hero.tagline) ??
    branding.restaurantName;

  return {
    restaurantName: branding.restaurantName,
    headline,
    description: asString(hero.description),
    imageUrls: buildHeroImages(hero),
    logoUrl: branding.logo,
    cta: hero.cta ? buildCta(hero.cta) : defaultCta,
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

function buildHighlights(blob: Json): LandingFeatureView[] {
  const highlights = Array.isArray(blob.highlights) ? blob.highlights : [];

  return highlights
    .map((entry): LandingFeatureView | null => {
      const block = asObject(entry);
      const heading = asString(block.heading);
      const body = asString(block.body);
      if (!heading || !body) {
        return null;
      }
      return {
        heading,
        body,
        ...buildImageFields(block),
        cta: buildOptionalCta(block.cta),
      };
    })
    .filter((block): block is LandingFeatureView => block !== null);
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
    mapEmbedUrl:
      asString(location.mapEmbedUrl) ??
      asString(location.mapEmbed) ??
      buildGoogleMapsEmbedUrl(address, asString(location.mapUrl)),
    mapUrl: asString(location.mapUrl),
  };
}

function buildContact(blob: Json): LandingContactView | null {
  const contact = asObject(blob.contact);
  const phone = asString(contact.phone);
  const email = asString(contact.email);

  if (!phone && !email) {
    return null;
  }

  return {
    heading: asString(contact.heading) ?? DEFAULT_CONTACT_HEADING,
    phone,
    email,
  };
}

function buildPrivateDining(blob: Json): LandingCalloutView | null {
  const block = asObject(blob.privateDining);
  const heading = asString(block.heading);
  const body = asString(block.body);

  if (!heading || !body) {
    return null;
  }

  return {
    heading,
    body,
    ...buildImageFields(block),
    cta: buildOptionalCta(block.cta),
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

/**
 * Builds the {@link LandingViewModel} from branding and the raw `landing` blob.
 * Sections with no usable content are omitted; hero and default CTA always render.
 */
export function buildLandingViewModel(
  branding: LandingBranding,
  landingRaw: unknown,
): LandingViewModel {
  const blob = asObject(landingRaw);
  const cta = buildCta(blob.cta);

  return {
    hero: buildHero(branding, blob, cta),
    about: buildAbout(blob),
    highlights: buildHighlights(blob),
    hours: buildHours(blob),
    location: buildLocation(blob),
    contact: buildContact(blob),
    privateDining: buildPrivateDining(blob),
    social: buildSocial(blob),
    cta,
  };
}
