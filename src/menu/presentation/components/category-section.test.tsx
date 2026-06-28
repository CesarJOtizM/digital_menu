// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { testUnavailableLabel } from "@/i18n/test-labels";
import { CategorySection } from "./category-section";
import type { CategoryView, ItemView } from "../view-model/menu-view-model";

function makeItemView(overrides: Partial<ItemView> = {}): ItemView {
  return {
    id: overrides.id ?? "item-1",
    name: overrides.name ?? "Croquetas",
    description: overrides.description ?? "",
    priceDisplay: overrides.priceDisplay ?? "15.00",
    imageUrl: null,
    hasImage: false,
    unavailable: overrides.unavailable ?? false,
    variants: [],
    modifierGroups: [],
    allergens: [],
  };
}

function makeCategory(overrides: Partial<CategoryView> = {}): CategoryView {
  return {
    id: overrides.id ?? "cat-1",
    name: overrides.name ?? "Appetizers",
    items: overrides.items ?? [makeItemView()],
  };
}

describe("CategorySection", () => {
  it("renders the category name as a heading", () => {
    render(<CategorySection unavailableLabel={testUnavailableLabel} category={makeCategory({ name: "Salads" })} />);

    expect(screen.getByRole("heading", { name: "Salads" })).toBeInTheDocument();
  });

  it("renders one row per item in the category", () => {
    const category = makeCategory({
      name: "Sharing",
      items: [
        makeItemView({ id: "a", name: "Fish Tacos" }),
        makeItemView({ id: "b", name: "KFC" }),
        makeItemView({ id: "c", name: "Arroz con Pollo" }),
      ],
    });

    render(<CategorySection unavailableLabel={testUnavailableLabel} category={category} />);

    expect(screen.getByText("Fish Tacos")).toBeInTheDocument();
    expect(screen.getByText("KFC")).toBeInTheDocument();
    expect(screen.getByText("Arroz con Pollo")).toBeInTheDocument();
  });

  it("renders unavailable items marked but still present (NOT hidden)", () => {
    const category = makeCategory({
      items: [
        makeItemView({ id: "a", name: "Available Dish", unavailable: false }),
        makeItemView({ id: "b", name: "Closed Dish", unavailable: true }),
      ],
    });

    render(<CategorySection unavailableLabel={testUnavailableLabel} category={category} />);

    expect(screen.getByText("Available Dish")).toBeInTheDocument();
    expect(screen.getByText("Closed Dish")).toBeInTheDocument();
    expect(screen.getByText(testUnavailableLabel)).toBeInTheDocument();
  });
});
