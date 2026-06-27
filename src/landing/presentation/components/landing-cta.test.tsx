// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingCta } from "./landing-cta";

describe("LandingCta", () => {
  it("renders an internal link to the menu", () => {
    render(<LandingCta cta={{ label: "View Menu", href: "/menu" }} />);

    expect(screen.getByRole("link", { name: "View Menu" })).toHaveAttribute(
      "href",
      "/menu",
    );
  });

  it("renders external links such as mailto", () => {
    render(
      <LandingCta cta={{ label: "Contact Us", href: "mailto:info@azaharpr.com" }} />,
    );

    const link = screen.getByRole("link", { name: "Contact Us" });
    expect(link).toHaveAttribute("href", "mailto:info@azaharpr.com");
    expect(link).not.toHaveAttribute("target");
  });
});

describe("ViewMenuCTA alias", () => {
  it("re-exports LandingCta as ViewMenuCTA", async () => {
    const { ViewMenuCTA } = await import("./view-menu-cta");
    render(<ViewMenuCTA cta={{ label: "View Menu", href: "/menu" }} />);

    expect(screen.getByRole("link", { name: "View Menu" })).toHaveAttribute(
      "href",
      "/menu",
    );
  });
});
