// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureSection } from "./feature-section";
import type { LandingFeatureView } from "../landing-view-model";

function makeFeature(
  overrides: Partial<LandingFeatureView> = {},
): LandingFeatureView {
  return {
    heading: "Spanish Tapas, Local Flavor",
    body: "Plates made to share.",
    imageUrl: "/uploads/landing/feature-tapas.svg",
    imageAlt: "Spanish Tapas",
    cta: { label: "View Menu", href: "/menu" },
    ...overrides,
  };
}

describe("FeatureSection", () => {
  it("renders the feature image beside the copy", () => {
    render(<FeatureSection feature={makeFeature()} index={0} />);

    expect(
      screen.getByRole("heading", { name: "Spanish Tapas, Local Flavor" }),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Spanish Tapas")).toBeInTheDocument();
  });

  it("renders without an image frame when imageUrl is null", () => {
    render(
      <FeatureSection
        feature={makeFeature({ imageUrl: null, imageAlt: null })}
        index={0}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
