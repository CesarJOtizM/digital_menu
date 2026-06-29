// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { testMenuUiLabels } from "@/i18n/test-labels";
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
    homeLink: overrides.homeLink ?? null,
  };
}

describe("MenuPage", () => {
  it("renders the restaurant name in the hero", () => {
    render(
      <MenuPage
        viewModel={makeViewModel({ restaurantName: "Azahar" })}
        labels={testMenuUiLabels}
      />,
    );

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

    render(<MenuPage viewModel={viewModel} labels={testMenuUiLabels} />);

    expect(screen.getByRole("heading", { name: "Mains" })).toBeInTheDocument();
    expect(screen.getByText("Churrasco")).toBeInTheDocument();
    expect(screen.getByText("32.00")).toBeInTheDocument();
  });

  it("renders the empty state (and no category) when the menu is empty", () => {
    render(
      <MenuPage
        viewModel={makeViewModel({ isEmpty: true, categories: [] })}
        labels={testMenuUiLabels}
      />,
    );

    expect(screen.getByText(/preparando la carta/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Appetizers" })).not.toBeInTheDocument();
  });

  it("never renders cart, checkout or order controls", () => {
    render(<MenuPage viewModel={makeViewModel()} labels={testMenuUiLabels} />);

    expect(screen.queryByRole("button", { name: /add|cart|order|checkout/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/checkout/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
  });

  it("offers an accessible list/cards layout toggle for a non-empty menu", () => {
    render(<MenuPage viewModel={makeViewModel()} labels={testMenuUiLabels} />);

    expect(
      screen.getByRole("group", { name: testMenuUiLabels.viewToggleAria }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: testMenuUiLabels.listView }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: testMenuUiLabels.cardsView }),
    ).toBeInTheDocument();
  });

  it("switches the non-empty menu to the image-forward card grid on toggle", () => {
    render(<MenuPage viewModel={makeViewModel()} labels={testMenuUiLabels} />);

    // Default list layout: the text-only item shows no image.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: testMenuUiLabels.cardsView }));

    // Card layout renders a placeholder image, and the dish is still present.
    expect(screen.getByRole("img", { name: /croquetas/i })).toBeInTheDocument();
    expect(screen.getByText("Croquetas")).toBeInTheDocument();
  });

  it("does not render the layout toggle when the menu is empty", () => {
    render(
      <MenuPage
        viewModel={makeViewModel({ isEmpty: true, categories: [] })}
        labels={testMenuUiLabels}
      />,
    );

    expect(
      screen.queryByRole("group", { name: testMenuUiLabels.viewToggleAria }),
    ).not.toBeInTheDocument();
  });

  it("renders a back link in the corner when the landing is enabled", () => {
    render(
      <MenuPage
        viewModel={makeViewModel({
          homeLink: { label: "Inicio", href: "/" },
        })}
        labels={testMenuUiLabels}
      />,
    );

    expect(screen.getByRole("link", { name: /inicio/i })).toHaveAttribute("href", "/");
  });

  it("omits the back link when landing is disabled", () => {
    render(
      <MenuPage viewModel={makeViewModel({ homeLink: null })} labels={testMenuUiLabels} />,
    );

    expect(screen.queryByRole("link", { name: /inicio/i })).not.toBeInTheDocument();
  });
});
