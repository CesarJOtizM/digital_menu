// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { testMenuUiLabels } from "@/i18n/test-labels";
import { ItemDetailSheet } from "./item-detail-sheet";
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

describe("ItemDetailSheet", () => {
  it("renders nothing when no item is selected", () => {
    const { container } = render(
      <ItemDetailSheet
        item={null}
        labels={testMenuUiLabels.itemDetail}
        onClose={() => {}}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("opens a dialog with the item name, description and close control", () => {
    render(
      <ItemDetailSheet
        item={makeItemView({ name: "Pulpo", description: "Galician octopus" })}
        labels={testMenuUiLabels.itemDetail}
        onClose={() => {}}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pulpo" })).toBeInTheDocument();
    expect(screen.getByText("Galician octopus")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: testMenuUiLabels.itemDetail.closeDetail }),
    ).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <ItemDetailSheet
        item={makeItemView()}
        labels={testMenuUiLabels.itemDetail}
        onClose={onClose}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: testMenuUiLabels.itemDetail.closeDetail }),
    );

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <ItemDetailSheet
        item={makeItemView()}
        labels={testMenuUiLabels.itemDetail}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does NOT render any add-to-cart / quantity / order control", () => {
    render(
      <ItemDetailSheet
        item={makeItemView()}
        labels={testMenuUiLabels.itemDetail}
        onClose={() => {}}
      />,
    );

    expect(screen.queryByText(/add to cart/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });
});
