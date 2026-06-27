// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocationSection } from "./location-section";

describe("LocationSection", () => {
  it("renders the heading and the address", () => {
    render(
      <LocationSection
        location={{
          heading: "Donde estamos",
          address: "Av. Siempreviva 742",
          mapUrl: null,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Donde estamos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Av. Siempreviva 742")).toBeInTheDocument();
  });

  it("renders a map link when mapUrl is set", () => {
    render(
      <LocationSection
        location={{
          heading: "Donde estamos",
          address: "Av. Siempreviva 742",
          mapUrl: "https://maps.example.com/azahar",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: /map|directions|maps/i })).toHaveAttribute(
      "href",
      "https://maps.example.com/azahar",
    );
  });

  it("renders no map link when mapUrl is null", () => {
    render(
      <LocationSection
        location={{
          heading: "Donde estamos",
          address: "Av. Siempreviva 742",
          mapUrl: null,
        }}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
