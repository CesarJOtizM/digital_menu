import { describe, expect, it } from "vitest";
import { testLandingNavLabels } from "@/i18n/test-labels";
import {
  buildLandingNavigation,
  buildLandingNavigationFromViewModel,
  featureSectionId,
} from "./landing-navigation";

describe("buildLandingNavigation", () => {
  it("builds header links and footer section anchors", () => {
    const nav = buildLandingNavigation({
      restaurantName: "Azahar Modern Tasca",
      aboutHeading: "Bienvenidos a Azahar",
      highlightHeadings: ["Tapas españolas, sabor local"],
      privateDiningHeading: "Eventos privados y celebraciones",
      hoursHeading: "Horario semanal",
      locationHeading: "Ubicación",
      contactHeading: "Contacto",
      menuHref: "/menu",
      reserveHref: "https://wa.me/17874828182",
      labels: testLandingNavLabels,
    });

    expect(nav.headerLinks.map((l) => l.label)).toEqual([
      "Carta",
      "Nosotros",
      "Contacto",
      "Reservaciones",
    ]);
    expect(nav.footerMenuLinks).toEqual([{ label: "Ver carta", href: "/menu" }]);
    expect(nav.footerPageLinks.map((l) => l.href)).toEqual([
      "#about",
      `#${featureSectionId("Tapas españolas, sabor local")}`,
      "#private-dining",
      "#hours",
      "#location",
      "#contact",
    ]);
  });
});

describe("buildLandingNavigationFromViewModel", () => {
  it("uses the private dining WhatsApp link for reservations", () => {
    const nav = buildLandingNavigationFromViewModel(
      {
        hero: { restaurantName: "Azahar" },
        about: { heading: "Nosotros" },
        highlights: [
          {
            heading: "Condado",
            cta: { label: "Reservar", href: "https://wa.me/111" },
          },
        ],
        privateDining: {
          heading: "Eventos privados",
          cta: { label: "Reservar mesa", href: "https://wa.me/222" },
        },
        hours: null,
        location: null,
        contact: null,
        cta: { label: "Ver carta", href: "/menu" },
      },
      testLandingNavLabels,
    );

    expect(nav.headerLinks.find((l) => l.label === "Reservaciones")?.href).toBe(
      "https://wa.me/222",
    );
  });
});
