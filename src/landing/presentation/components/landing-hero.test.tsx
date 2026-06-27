// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingHero } from "./landing-hero";
import type { LandingHeroView } from "../landing-view-model";

function makeHero(overrides: Partial<LandingHeroView> = {}): LandingHeroView {
  return {
    restaurantName: overrides.restaurantName ?? "Azahar Modern Tasca",
    headline: overrides.headline ?? "Modern Tapas, Sunset Views",
    description: overrides.description ?? "Spanish-inspired dining in Condado.",
    imageUrls: overrides.imageUrls ?? ["/uploads/landing/hero-1.svg"],
    logoUrl: overrides.logoUrl ?? null,
    cta: overrides.cta ?? { label: "View Menu", href: "/menu" },
  };
}

describe("LandingHero", () => {
  it("renders the headline as the page heading", () => {
    render(<LandingHero hero={makeHero()} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Modern Tapas, Sunset Views",
      }),
    ).toBeInTheDocument();
  });

  it("renders hero slides, description and CTA", () => {
    render(<LandingHero hero={makeHero()} />);

    expect(
      screen.getByText("Spanish-inspired dining in Condado."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Menu" })).toHaveAttribute(
      "href",
      "/menu",
    );
    expect(screen.getByAltText("Azahar Modern Tasca")).toBeInTheDocument();
  });

  it("renders no image when imageUrls is empty", () => {
    render(<LandingHero hero={makeHero({ imageUrls: [] })} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
