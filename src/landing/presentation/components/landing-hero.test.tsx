// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingHero } from "./landing-hero";
import type { LandingHeroView } from "../landing-view-model";

function makeHero(overrides: Partial<LandingHeroView> = {}): LandingHeroView {
  return {
    restaurantName: overrides.restaurantName ?? "Azahar",
    imageUrl: overrides.imageUrl ?? null,
    tagline: overrides.tagline ?? null,
    logoUrl: overrides.logoUrl ?? null,
  };
}

describe("LandingHero", () => {
  it("renders the restaurant name as the page heading", () => {
    render(<LandingHero hero={makeHero({ restaurantName: "Azahar" })} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Azahar" }),
    ).toBeInTheDocument();
  });

  it("renders the tagline when present", () => {
    render(<LandingHero hero={makeHero({ tagline: "Cocina de brasa" })} />);

    expect(screen.getByText("Cocina de brasa")).toBeInTheDocument();
  });

  it("renders the hero image with the restaurant name as alt text", () => {
    render(
      <LandingHero
        hero={makeHero({
          restaurantName: "Azahar",
          imageUrl: "https://cdn.example.com/hero.jpg",
        })}
      />,
    );

    expect(screen.getByAltText("Azahar")).toBeInTheDocument();
  });

  it("renders no image when imageUrl is null", () => {
    render(<LandingHero hero={makeHero({ imageUrl: null })} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
