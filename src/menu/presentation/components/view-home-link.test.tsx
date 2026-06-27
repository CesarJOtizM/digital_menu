// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewHomeLink } from "./view-home-link";

describe("ViewHomeLink", () => {
  it("renders the label as a link to the landing", () => {
    render(<ViewHomeLink homeLink={{ label: "Back", href: "/" }} />);

    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute("href", "/");
  });
});
