// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { testMenuUiLabels } from "@/i18n/test-labels";
import { MenuViewSwitcher } from "./menu-view-switcher";
import type { CategoryView } from "../view-model/menu-view-model";

const STORAGE_KEY = "menu:view-mode";

const categories: readonly CategoryView[] = [
  {
    id: "cat-1",
    name: "Starters",
    items: [
      {
        id: "a",
        name: "Patatas Bravas",
        description: "Spicy potatoes",
        priceDisplay: "8.00",
        imageUrl: null,
        hasImage: false,
        unavailable: false,
        variants: [],
        modifierGroups: [],
        allergens: [],
      },
    ],
  },
];

function renderSwitcher() {
  return render(<MenuViewSwitcher categories={categories} labels={testMenuUiLabels} />);
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("MenuViewSwitcher", () => {
  it("renders an accessible toggle with both layout options", () => {
    renderSwitcher();

    expect(
      screen.getByRole("group", { name: testMenuUiLabels.viewToggleAria }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: testMenuUiLabels.listView })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: testMenuUiLabels.cardsView })).toBeInTheDocument();
  });

  it("defaults to the list layout with the list option pressed", () => {
    renderSwitcher();

    // The list layout uses editorial rows; the card grid wraps images in <img>.
    // Default render shows the dish but NO image (list/no-image item).
    expect(screen.getByText("Patatas Bravas")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: testMenuUiLabels.listView })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("switches to the card grid when the Cards option is activated", () => {
    renderSwitcher();

    fireEvent.click(screen.getByRole("button", { name: testMenuUiLabels.cardsView }));

    // The card layout renders a placeholder image even for a text-only item.
    expect(screen.getByRole("img", { name: /patatas bravas/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: testMenuUiLabels.cardsView })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("switches back to the list layout from the card grid", () => {
    renderSwitcher();

    fireEvent.click(screen.getByRole("button", { name: testMenuUiLabels.cardsView }));
    expect(screen.getByRole("img", { name: /patatas bravas/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: testMenuUiLabels.listView }));
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Patatas Bravas")).toBeInTheDocument();
  });

  it("persists the chosen layout to localStorage", () => {
    renderSwitcher();

    fireEvent.click(screen.getByRole("button", { name: testMenuUiLabels.cardsView }));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("cards");
  });

  it("restores a previously stored 'cards' preference on mount", async () => {
    window.localStorage.setItem(STORAGE_KEY, "cards");

    renderSwitcher();

    // After the mount effect reads the stored pref, the card grid (with its
    // placeholder image) is shown without any user interaction.
    expect(await screen.findByRole("img", { name: /patatas bravas/i })).toBeInTheDocument();
  });
});
