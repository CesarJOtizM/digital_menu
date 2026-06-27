import type { Metadata } from "next";
import type { DeployConfig } from "./deploy-config";

export interface SiteSeoInput {
  readonly title?: string;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly ogImage?: string;
  readonly path?: string;
}

type Json = Record<string, unknown>;

function asObject(value: unknown): Json {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Json)
    : {};
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function parseSeoFromLanding(landing: unknown): SiteSeoInput {
  const seo = asObject(asObject(landing).seo);
  const keywords = Array.isArray(seo.keywords)
    ? seo.keywords
        .map(asString)
        .filter((keyword): keyword is string => keyword !== null)
    : undefined;

  return {
    title: asString(seo.title) ?? undefined,
    description: asString(seo.description) ?? undefined,
    keywords,
    ogImage: asString(seo.ogImage) ?? undefined,
  };
}

function heroDescription(landing: unknown): string | null {
  const hero = asObject(asObject(landing).hero);
  return asString(hero.description);
}

/**
 * Builds Next.js {@link Metadata} for public pages from deploy config + optional
 * landing `seo` blob overrides.
 */
export function buildSiteMetadata(
  config: DeployConfig,
  overrides: SiteSeoInput = {},
): Metadata {
  const fromLanding = parseSeoFromLanding(config.landing);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const path = overrides.path ?? "";
  const url = `${baseUrl}${path}`;

  const defaultDescription =
    heroDescription(config.landing) ??
    `${config.restaurantName} — tapas modernas, cócteles y experiencias junto a la laguna en Condado, San Juan.`;

  const title = overrides.title ?? fromLanding.title ?? config.restaurantName;
  const description =
    overrides.description ?? fromLanding.description ?? defaultDescription;
  const keywords = overrides.keywords ??
    fromLanding.keywords ?? [
      config.restaurantName,
      "restaurante Condado",
      "tapas San Juan",
      "carta digital",
      "Azahar",
    ];
  const ogImage =
    overrides.ogImage ??
    fromLanding.ogImage ??
    `${baseUrl}/uploads/landing/hero-1.svg`;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: title,
      template: `%s | ${config.restaurantName}`,
    },
    description,
    keywords: [...keywords],
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: config.locale.replace("-", "_"),
      url,
      siteName: config.restaurantName,
      title,
      description,
      images: [{ url: ogImage, alt: config.restaurantName }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
