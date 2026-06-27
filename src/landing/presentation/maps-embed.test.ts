import { describe, expect, it } from "vitest";
import { buildGoogleMapsEmbedUrl } from "./maps-embed";

describe("buildGoogleMapsEmbedUrl", () => {
  it("embeds from the address when no map link is configured", () => {
    expect(buildGoogleMapsEmbedUrl("886 Ashford Ave, San Juan, PR")).toBe(
      "https://maps.google.com/maps?q=886%20Ashford%20Ave%2C%20San%20Juan%2C%20PR&z=16&output=embed",
    );
  });

  it("reuses the q= parameter from a configured Google Maps URL", () => {
    expect(
      buildGoogleMapsEmbedUrl(
        "886 Ashford Ave, San Juan, PR",
        "https://maps.google.com/?q=Azahar+Condado",
      ),
    ).toBe(
      "https://maps.google.com/maps?q=Azahar%20Condado&z=16&output=embed",
    );
  });
});
