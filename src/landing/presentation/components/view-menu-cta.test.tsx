// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewMenuCTA } from "./view-menu-cta";

describe("ViewMenuCTA", () => {
  it("renders the CTA label as a link to the menu", () => {
    render(<ViewMenuCTA cta={{ label: "Ver la carta", href: "/menu" }} />);

    expect(screen.getByRole("link", { name: "Ver la carta" })).toHaveAttribute(
      "href",
      "/menu",
    );
  });

  it("renders the default label when configured so", () => {
    render(<ViewMenuCTA cta={{ label: "View Menu", href: "/menu" }} />);

    expect(screen.getByRole("link", { name: "View Menu" })).toHaveAttribute(
      "href",
      "/menu",
    );
  });
});
