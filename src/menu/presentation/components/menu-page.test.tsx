// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MenuPage } from "./menu-page";
import type { MenuViewModel } from "../view-model/menu-view-model";

function makeViewModel(overrides: Partial<MenuViewModel> = {}): MenuViewModel {
  return {
    restaurantName: overrides.restaurantName ?? "Azahar",
    isEmpty: overrides.isEmpty ?? false,
    categories: overrides.categories ?? [
      {
        id: "cat-1",
        name: "Appetizers",
        items: [
          {
            id: "item-1",
            name: "Croquetas",
            description: "Ask about daily special.",
            priceDisplay: "15.00",
            imageUrl: null,
            hasImage: false,
            unavailable: false,
            variants: [],
            modifierGroups: [],
            allergens: [],
          },
        ],
      },
    ],
  };
}

describe("MenuPage", () => {
  it("renders the restaurant name in the hero", () => {
    render(<MenuPage viewModel={makeViewModel({ restaurantName: "Azahar" })} />);

    expect(screen.getByText("Azahar")).toBeInTheDocument();
  });

  it("renders all categories and items for a non-empty menu", () => {
    const viewModel = makeViewModel({
      categories: [
        {
          id: "c1",
          name: "Mains",
          items: [
            {
              id: "i1",
              name: "Churrasco",
              description: "Skirt Steak",
              priceDisplay: "32.00",
              imageUrl: null,
              hasImage: false,
              unavailable: false,
              variants: [],
              modifierGroups: [],
              allergens: [],
            },
          ],
        },
      ],
    });

    render(<MenuPage viewModel={viewModel} />);

    expect(screen.getByRole("heading", { name: "Mains" })).toBeInTheDocument();
    expect(screen.getByText("Churrasco")).toBeInTheDocument();
    expect(screen.getByText("32.00")).toBeInTheDocument();
  });

  it("renders the empty state (and no category) when the menu is empty", () => {
    render(<MenuPage viewModel={makeViewModel({ isEmpty: true, categories: [] })} />);

    expect(screen.getByText(/menu is being prepared/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Appetizers" })).not.toBeInTheDocument();
  });

  it("never renders cart, checkout or order controls", () => {
    render(<MenuPage viewModel={makeViewModel()} />);

    expect(screen.queryByRole("button", { name: /add|cart|order|checkout/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/checkout/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });
});
