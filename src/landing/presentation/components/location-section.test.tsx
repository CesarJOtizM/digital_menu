// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationSection } from "./location-section";

const baseLocation = {
  heading: "Location",
  address: "886 Ashford Ave, San Juan, PR",
  mapEmbedUrl:
    "https://maps.google.com/maps?q=886%20Ashford%20Ave&z=16&output=embed",
  mapUrl: "https://maps.google.com/?q=Azahar+Condado",
} as const;

describe("LocationSection", () => {
  it("renders the heading, address and embedded map", () => {
    render(<LocationSection location={baseLocation} />);

    expect(screen.getByRole("heading", { name: "Location" })).toBeInTheDocument();
    expect(screen.getByText("886 Ashford Ave, San Juan, PR")).toBeInTheDocument();
    expect(
      screen.getByTitle("Mapa — 886 Ashford Ave, San Juan, PR"),
    ).toHaveAttribute("src", baseLocation.mapEmbedUrl);
  });

  it("links to the configured map URL for directions", () => {
    render(<LocationSection location={baseLocation} />);

    expect(screen.getByRole("link", { name: /abrir en google maps/i })).toHaveAttribute(
      "href",
      "https://maps.google.com/?q=Azahar+Condado",
    );
  });

  it("falls back to a maps search link when mapUrl is null", () => {
    render(
      <LocationSection
        location={{
          ...baseLocation,
          mapUrl: null,
        }}
      />,
    );

    expect(screen.getByRole("link", { name: /abrir en google maps/i })).toHaveAttribute(
      "href",
      "https://maps.google.com/?q=886%20Ashford%20Ave%2C%20San%20Juan%2C%20PR",
    );
  });
});
