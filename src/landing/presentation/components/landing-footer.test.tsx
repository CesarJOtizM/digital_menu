// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingFooter } from "./landing-footer";
import { buildLandingNavigation } from "../landing-navigation";

const navigation = buildLandingNavigation({
  restaurantName: "Azahar Modern Tasca",
  aboutHeading: "Bienvenidos a Azahar",
  highlightHeadings: ["Tapas españolas, sabor local"],
  privateDiningHeading: "Eventos privados y celebraciones",
  hoursHeading: "Horario semanal",
  locationHeading: "Ubicación",
  contactHeading: "Contacto",
  menuHref: "/menu",
  reserveHref: "https://wa.me/17874828182",
});

describe("LandingFooter", () => {
  it("lists menu and page sections in the footer", () => {
    render(
      <LandingFooter
        navigation={navigation}
        social={[{ label: "Instagram", url: "https://instagram.com/azaharpr" }]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Carta" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Página" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver carta" })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("link", { name: "Horario semanal" })).toHaveAttribute(
      "href",
      "#hours",
    );
  });
});
