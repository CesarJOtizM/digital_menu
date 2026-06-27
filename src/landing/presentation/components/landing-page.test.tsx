// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingPage } from "./landing-page";
import type { LandingViewModel } from "../landing-view-model";

const SITE_URL = "http://localhost:3000";

function makeViewModel(overrides: Partial<LandingViewModel> = {}): LandingViewModel {
  return {
    hero: overrides.hero ?? {
      restaurantName: "Azahar Modern Tasca",
      headline: "Tapas modernas, vistas al atardecer",
      description: "Cocina y cócteles en Condado.",
      imageUrls: ["/uploads/landing/hero-1.svg"],
      logoUrl: null,
      cta: { label: "Ver carta", href: "/menu" },
    },
    about:
      overrides.about === undefined
        ? {
            heading: "Bienvenidos a Azahar Modern Tasca",
            paragraphs: ["Reúnete sin prisa, comparte a menudo."],
          }
        : overrides.about,
    highlights:
      overrides.highlights ?? [
        {
          heading: "Tapas españolas, sabor local",
          body: "Platos para compartir.",
          imageUrl: "/uploads/landing/feature-tapas.svg",
          imageAlt: "Tapas",
          cta: { label: "Ver carta", href: "/menu" },
        },
      ],
    hours:
      overrides.hours === undefined
        ? { heading: "Horario semanal", rows: [{ day: "Lunes", hours: "11–23" }] }
        : overrides.hours,
    location:
      overrides.location === undefined
        ? {
            heading: "Ubicación",
            address: "886 Ashford Ave, San Juan, PR",
            mapEmbedUrl:
              "https://maps.google.com/maps?q=886&z=16&output=embed",
            mapUrl: null,
          }
        : overrides.location,
    contact:
      overrides.contact === undefined
        ? {
            heading: "Contacto",
            phone: "(787) 482-8182",
            email: "info@azaharpr.com",
          }
        : overrides.contact,
    privateDining:
      overrides.privateDining === undefined
        ? {
            heading: "Eventos privados y celebraciones",
            body: "Celebra con nosotros.",
            imageUrl: "/uploads/landing/feature-private.svg",
            imageAlt: "Eventos privados",
            cta: { label: "Reservar mesa", href: "https://wa.me/17874828182" },
          }
        : overrides.privateDining,
    social:
      overrides.social ?? [{ label: "Instagram", url: "https://instagram.com/azaharpr" }],
    cta: overrides.cta ?? { label: "Ver carta", href: "/menu" },
  };
}

describe("LandingPage", () => {
  it("renders the hero headline and welcome section", () => {
    render(<LandingPage viewModel={makeViewModel()} siteUrl={SITE_URL} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Tapas modernas, vistas al atardecer",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Bienvenidos a Azahar Modern Tasca" }),
    ).toBeInTheDocument();
  });

  it("renders navigation, images and footer links", () => {
    render(<LandingPage viewModel={makeViewModel()} siteUrl={SITE_URL} />);

    expect(
      screen.getByRole("navigation", { name: /navegación principal/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Carta" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Página" })).toBeInTheDocument();
    expect(screen.getByAltText("Azahar Modern Tasca")).toBeInTheDocument();
    expect(screen.getByText("info@azaharpr.com")).toBeInTheDocument();
  });

  it("renders private dining before weekly hours", () => {
    render(<LandingPage viewModel={makeViewModel()} siteUrl={SITE_URL} />);

    const privateDining = screen.getByRole("heading", {
      name: "Eventos privados y celebraciones",
    });
    const weeklyHours = screen.getByRole("heading", { name: "Horario semanal" });

    expect(
      privateDining.compareDocumentPosition(weeklyHours) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("never renders cart, order or checkout controls (display-only)", () => {
    render(<LandingPage viewModel={makeViewModel()} siteUrl={SITE_URL} />);

    expect(
      screen.queryByRole("button", { name: /add|cart|order|checkout/i }),
    ).not.toBeInTheDocument();
  });
});
