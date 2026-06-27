// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyMenuState } from "./empty-menu-state";

describe("EmptyMenuState", () => {
  it("renders a friendly empty-menu message without error", () => {
    render(<EmptyMenuState />);

    expect(screen.getByText(/preparando la carta/i)).toBeInTheDocument();
  });

  it("renders no menu item, cart or order control in the empty state", () => {
    render(<EmptyMenuState />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText(/add to cart/i)).not.toBeInTheDocument();
  });
});
