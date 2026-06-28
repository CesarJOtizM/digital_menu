// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { testUnavailableLabel } from "@/i18n/test-labels";
import { ItemRow } from "./item-row";
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

describe("ItemRow", () => {
  it("renders the item name, description and bare-number price", () => {
    render(<ItemRow unavailableLabel={testUnavailableLabel} item={makeItemView({ name: "Cesar", description: "House Made Dressing", priceDisplay: "17.00" })} />);

    expect(screen.getByText("Cesar")).toBeInTheDocument();
    expect(screen.getByText("House Made Dressing")).toBeInTheDocument();
    expect(screen.getByText("17.00")).toBeInTheDocument();
  });

  it("does NOT render any add-to-cart / quantity / order control", () => {
    render(<ItemRow unavailableLabel={testUnavailableLabel} item={makeItemView()} />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByText(/add to cart/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/add to order/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("shows an 'unavailable' marker when the item is unavailable (NOT hidden)", () => {
    render(<ItemRow unavailableLabel={testUnavailableLabel} item={makeItemView({ name: "Costillas", unavailable: true })} />);

    // The item is still shown...
    expect(screen.getByText("Costillas")).toBeInTheDocument();
    // ...but marked unavailable.
    expect(screen.getByText(testUnavailableLabel)).toBeInTheDocument();
  });

  it("does not show an unavailable marker for an available item", () => {
    render(<ItemRow unavailableLabel={testUnavailableLabel} item={makeItemView({ unavailable: false })} />);

    expect(screen.queryByText(testUnavailableLabel)).not.toBeInTheDocument();
  });

  it("renders a thumbnail image when the item has one", () => {
    render(
      <ItemRow
        item={makeItemView({ name: "Pulpo", hasImage: true, imageUrl: "/uploads/items/pulpo.jpg" })}
      />,
    );

    const img = screen.getByRole("img", { name: /pulpo/i });
    expect(img).toBeInTheDocument();
  });

  it("renders no image for a text-only item", () => {
    render(<ItemRow unavailableLabel={testUnavailableLabel} item={makeItemView({ name: "Burrata", hasImage: false, imageUrl: null })} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    // Text-only rows still show the name.
    expect(screen.getByText("Burrata")).toBeInTheDocument();
  });

  it("renders variant labels with their prices", () => {
    render(
      <ItemRow
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

  it("renders modifier group names, options and signed deltas", () => {
    render(
      <ItemRow
        item={makeItemView({
          modifierGroups: [
            {
              name: "Extras",
              options: [
                { name: "Cheese", priceDeltaDisplay: "+3.00" },
                { name: "No salt", priceDeltaDisplay: null },
              ],
            },
          ],
        })}
      />,
    );

    expect(screen.getByText("Extras")).toBeInTheDocument();
    expect(screen.getByText(/Cheese/)).toBeInTheDocument();
    expect(screen.getByText("+3.00")).toBeInTheDocument();
    expect(screen.getByText(/No salt/)).toBeInTheDocument();
  });

  it("renders allergen names subtly when present", () => {
    render(<ItemRow unavailableLabel={testUnavailableLabel} item={makeItemView({ allergens: ["Gluten", "Nuts"] })} />);

    expect(screen.getByText(/Gluten/)).toBeInTheDocument();
    expect(screen.getByText(/Nuts/)).toBeInTheDocument();
  });
});
