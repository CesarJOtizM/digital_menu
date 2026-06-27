// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingPage } from "./landing-page";
import type { LandingViewModel } from "../landing-view-model";

function makeViewModel(overrides: Partial<LandingViewModel> = {}): LandingViewModel {
  return {
    hero: overrides.hero ?? {
      restaurantName: "Azahar",
      imageUrl: null,
      tagline: "Cocina de brasa",
      logoUrl: null,
    },
    about:
      overrides.about === undefined
        ? { heading: "Sobre nosotros", paragraphs: ["Producto de mercado."] }
        : overrides.about,
    hours:
      overrides.hours === undefined
        ? { heading: "Horarios", rows: [{ day: "Mar–Jue", hours: "13–23" }] }
        : overrides.hours,
    location:
      overrides.location === undefined
        ? { heading: "Donde estamos", address: "Av. Siempreviva 742", mapUrl: null }
        : overrides.location,
    social:
      overrides.social ?? [{ label: "Instagram", url: "https://instagram.com/azahar" }],
    cta: overrides.cta ?? { label: "View Menu", href: "/menu" },
  };
}

describe("LandingPage", () => {
  it("renders the hero with the restaurant name and tagline", () => {
    render(<LandingPage viewModel={makeViewModel()} />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Azahar" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Cocina de brasa")).toBeInTheDocument();
  });

  it("renders every configured section and the menu CTA", () => {
    render(<LandingPage viewModel={makeViewModel()} />);

    expect(
      screen.getByRole("heading", { name: "Sobre nosotros" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Producto de mercado.")).toBeInTheDocument();
    expect(screen.getByText("Mar–Jue")).toBeInTheDocument();
    expect(screen.getByText("Av. Siempreviva 742")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Menu" })).toHaveAttribute(
      "href",
      "/menu",
    );
  });

  it("omits optional sections that are null but still renders hero and CTA", () => {
    render(
      <LandingPage
        viewModel={makeViewModel({
          about: null,
          hours: null,
          location: null,
          social: [],
        })}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Azahar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Menu" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Horarios" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Donde estamos" }),
    ).not.toBeInTheDocument();
  });

  it("never renders cart, order or checkout controls (display-only)", () => {
    render(<LandingPage viewModel={makeViewModel()} />);

    expect(
      screen.queryByRole("button", { name: /add|cart|order|checkout/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/checkout/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });
});
