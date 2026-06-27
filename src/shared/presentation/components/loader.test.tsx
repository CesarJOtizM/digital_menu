// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Loader } from "./loader";

describe("Loader", () => {
  it("renders a polite status region with the default label", () => {
    render(<Loader />);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Un momento")).toBeInTheDocument();
  });

  it("renders a custom label", () => {
    render(<Loader label="Preparing your menu" />);

    expect(screen.getByText("Preparing your menu")).toBeInTheDocument();
  });

  it("marks the spinner as decorative for assistive tech", () => {
    render(<Loader />);

    expect(screen.getByRole("status").querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  it("applies the page surface layout by default", () => {
    render(<Loader />);

    expect(screen.getByRole("status")).toHaveClass("menu-surface", "min-h-screen");
  });

  it("supports a compact inline variant", () => {
    render(<Loader variant="inline" label="Saving" />);

    const status = screen.getByRole("status");
    expect(status).toHaveClass("inline-flex");
    expect(status).not.toHaveClass("min-h-screen");
  });
});
