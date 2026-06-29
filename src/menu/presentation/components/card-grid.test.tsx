// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { testUnavailableLabel } from "@/i18n/test-labels";
import { CardGrid } from "./card-grid";
import type { CategoryView, ItemView } from "../view-model/menu-view-model";

function makeItemView(overrides: Partial<ItemView> = {}): ItemView {
  return {
    id: overrides.id ?? "item-1",
    name: overrides.name ?? "Croquetas",
    description: overrides.description ?? "",
    priceDisplay: overrides.priceDisplay ?? "15.00",
    imageUrl: overrides.imageUrl ?? null,
    hasImage: overrides.hasImage ?? false,
    unavailable: overrides.unavailable ?? false,
    variants: [],
    modifierGroups: [],
    allergens: [],
  };
}

function makeCategories(): readonly CategoryView[] {
  return [
    {
      id: "cat-1",
      name: "Appetizers",
      items: [
        makeItemView({ id: "a", name: "Fish Tacos" }),
        makeItemView({ id: "b", name: "KFC", unavailable: true }),
      ],
    },
    {
      id: "cat-2",
      name: "Mains",
      items: [makeItemView({ id: "c", name: "Paella" })],
    },
  ];
}

describe("CardGrid", () => {
  it("renders each category name as a heading", () => {
    render(<CardGrid categories={makeCategories()} unavailableLabel={testUnavailableLabel} />);

    expect(screen.getByRole("heading", { name: "Appetizers" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mains" })).toBeInTheDocument();
  });

  it("renders a card for every item across all categories", () => {
    render(<CardGrid categories={makeCategories()} unavailableLabel={testUnavailableLabel} />);

    expect(screen.getByText("Fish Tacos")).toBeInTheDocument();
    expect(screen.getByText("KFC")).toBeInTheDocument();
    expect(screen.getByText("Paella")).toBeInTheDocument();
  });

  it("marks unavailable items but keeps them present (NOT hidden)", () => {
    render(<CardGrid categories={makeCategories()} unavailableLabel={testUnavailableLabel} />);

    // The unavailable dish is still rendered...
    expect(screen.getByText("KFC")).toBeInTheDocument();
    // ...and exactly one unavailable marker is shown (only KFC is unavailable).
    expect(screen.getAllByText(testUnavailableLabel)).toHaveLength(1);
  });
});
