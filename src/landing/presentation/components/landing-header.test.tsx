// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingHeader } from "./landing-header";
import { buildLandingNavigation } from "../landing-navigation";

const navigation = buildLandingNavigation({
  restaurantName: "Azahar Modern Tasca",
  aboutHeading: "Bienvenidos",
  highlightHeadings: [],
  privateDiningHeading: null,
  hoursHeading: null,
  locationHeading: null,
  contactHeading: "Contacto",
  menuHref: "/menu",
  reserveHref: "https://wa.me/17874828182",
});

describe("LandingHeader", () => {
  it("renders the restaurant name and main nav links", () => {
    render(<LandingHeader navigation={navigation} />);

    expect(screen.getByRole("link", { name: "Azahar Modern Tasca" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(
      screen.getByRole("navigation", { name: /navegación principal/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Carta" })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("link", { name: "Reservaciones" })).toHaveAttribute(
      "href",
      "https://wa.me/17874828182",
    );
  });
});
