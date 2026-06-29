// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { testUnavailableLabel } from "@/i18n/test-labels";
import { ItemCard } from "./item-card";
import type { ItemView } from "../view-model/menu-view-model";

function makeItemView(overrides: Partial<ItemView> = {}): ItemView {
  return {
    id: overrides.id ?? "item-1",
    name: overrides.name ?? "Croquetas",
    description: overrides.description ?? "Ask about daily special.",
    priceDisplay: overrides.priceDisplay ?? "15.00",
    imageUrl: overrides.imageUrl ?? null,
    hasImage: overrides.hasImage ?? false,
    unavailable: overrides.unavailable ?? false,
    variants: overrides.variants ?? [],
    modifierGroups: overrides.modifierGroups ?? [],
    allergens: overrides.allergens ?? [],
  };
}

describe("ItemCard", () => {
  it("renders the item name, description and bare-number price", () => {
    render(
      <ItemCard
        unavailableLabel={testUnavailableLabel}
        item={makeItemView({ name: "Pulpo", description: "Galician octopus", priceDisplay: "24.00" })}
      />,
    );

    expect(screen.getByText("Pulpo")).toBeInTheDocument();
    expect(screen.getByText("Galician octopus")).toBeInTheDocument();
    expect(screen.getByText("24.00")).toBeInTheDocument();
  });

  it("does NOT render any add-to-cart / quantity / order control", () => {
    render(<ItemCard unavailableLabel={testUnavailableLabel} item={makeItemView()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText(/add to cart/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("shows the dish image when the item has one", () => {
    render(
      <ItemCard
        unavailableLabel={testUnavailableLabel}
        item={makeItemView({ name: "Gambas", hasImage: true, imageUrl: "/uploads/items/gambas.jpg" })}
      />,
    );

    expect(screen.getByRole("img", { name: /gambas/i })).toBeInTheDocument();
  });

  it("renders a graceful placeholder image for a text-only (no-image) item", () => {
    render(
      <ItemCard
        unavailableLabel={testUnavailableLabel}
        item={makeItemView({ name: "Burrata", hasImage: false, imageUrl: null })}
      />,
    );

    // Card stays visually consistent: a placeholder image still renders, labelled
    // by the dish name, and the name itself remains visible.
    expect(screen.getByRole("img", { name: /burrata/i })).toBeInTheDocument();
    expect(screen.getByText("Burrata")).toBeInTheDocument();
  });

  it("shows an 'unavailable' marker when the item is unavailable (NOT hidden)", () => {
    render(
      <ItemCard
        unavailableLabel={testUnavailableLabel}
        item={makeItemView({ name: "Costillas", unavailable: true })}
      />,
    );

    expect(screen.getByText("Costillas")).toBeInTheDocument();
    expect(screen.getByText(testUnavailableLabel)).toBeInTheDocument();
  });

  it("does not show an unavailable marker for an available item", () => {
    render(
      <ItemCard unavailableLabel={testUnavailableLabel} item={makeItemView({ unavailable: false })} />,
    );

    expect(screen.queryByText(testUnavailableLabel)).not.toBeInTheDocument();
  });

  it("renders variant labels with their prices", () => {
    render(
      <ItemCard
        unavailableLabel={testUnavailableLabel}
        item={makeItemView({
          variants: [
            { label: "Large", priceDisplay: "20.00" },
            { label: "Small", priceDisplay: "12.00" },
          ],
        })}
      />,
    );

    expect(screen.getByText("Large")).toBeInTheDocument();
    expect(screen.getByText("20.00")).toBeInTheDocument();
    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("12.00")).toBeInTheDocument();
  });

  it("renders modifier options and allergen names when present", () => {
    render(
      <ItemCard
        unavailableLabel={testUnavailableLabel}
        item={makeItemView({
          modifierGroups: [
            {
              name: "Extras",
              options: [{ name: "Cheese", priceDeltaDisplay: "+3.00" }],
            },
          ],
          allergens: ["Gluten", "Nuts"],
        })}
      />,
    );

    expect(screen.getByText("Extras")).toBeInTheDocument();
    expect(screen.getByText(/Cheese/)).toBeInTheDocument();
    expect(screen.getByText("+3.00")).toBeInTheDocument();
    expect(screen.getByText(/Gluten/)).toBeInTheDocument();
    expect(screen.getByText(/Nuts/)).toBeInTheDocument();
  });
});
