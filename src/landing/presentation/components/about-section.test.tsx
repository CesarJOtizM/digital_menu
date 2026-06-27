// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AboutSection } from "./about-section";

describe("AboutSection", () => {
  it("renders the heading and every paragraph", () => {
    render(
      <AboutSection
        about={{
          heading: "Nuestra historia",
          paragraphs: ["Abrimos en 2019.", "Producto de mercado."],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Nuestra historia" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Abrimos en 2019.")).toBeInTheDocument();
    expect(screen.getByText("Producto de mercado.")).toBeInTheDocument();
  });
});
