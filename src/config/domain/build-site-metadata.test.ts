import { describe, expect, it } from "vitest";
import { buildSiteMetadata } from "./build-site-metadata";
import type { DeployConfig } from "./deploy-config";

const baseConfig: DeployConfig = {
  restaurantName: "Azahar Modern Tasca",
  logo: null,
  primaryColor: "#C0552E",
  secondaryColor: "#1B2A4A",
  currency: "USD",
  locale: "es-PR",
  timezone: "America/Puerto_Rico",
  showCurrencySymbol: false,
  landingEnabled: true,
  landing: {
    hero: { description: "Tapas y cócteles en Condado." },
    seo: {
      title: "Azahar | Tapas en Condado",
      description: "Descripción SEO personalizada.",
      keywords: ["tapas", "Condado"],
    },
  },
};

describe("buildSiteMetadata", () => {
  it("uses landing seo fields and sets Open Graph tags", () => {
    const metadata = buildSiteMetadata(baseConfig);

    expect(metadata.title).toEqual({
      default: "Azahar | Tapas en Condado",
      template: "%s | Azahar Modern Tasca",
    });
    expect(metadata.description).toBe("Descripción SEO personalizada.");
    expect(metadata.openGraph?.title).toBe("Azahar | Tapas en Condado");
    expect(metadata.twitter?.card).toBe("summary_large_image");
  });

  it("allows per-page overrides", () => {
    const metadata = buildSiteMetadata(baseConfig, {
      title: "Carta",
      path: "/menu",
    });

    expect(metadata.title).toEqual({
      default: "Carta",
      template: "%s | Azahar Modern Tasca",
    });
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/menu");
  });
});
