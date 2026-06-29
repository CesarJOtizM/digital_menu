// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { testMenuUiLabels } from "@/i18n/test-labels";
import {
  CategoryNav,
  resolveActiveCategoryId,
  STICKY_OFFSET_PX,
} from "./category-nav";

describe("resolveActiveCategoryId", () => {
  it("returns the last category whose heading has crossed the sticky offset", () => {
    document.body.innerHTML = `
      <h2 id="category-c1" style="position:absolute;top:0"></h2>
      <h2 id="category-c2" style="position:absolute;top:0"></h2>
      <h2 id="category-c3" style="position:absolute;top:0"></h2>
    `;

    const c1 = document.getElementById("category-c1")!;
    const c2 = document.getElementById("category-c2")!;
    const c3 = document.getElementById("category-c3")!;

    c1.getBoundingClientRect = () =>
      ({ top: STICKY_OFFSET_PX - 20 }) as DOMRect;
    c2.getBoundingClientRect = () =>
      ({ top: STICKY_OFFSET_PX - 5 }) as DOMRect;
    c3.getBoundingClientRect = () =>
      ({ top: STICKY_OFFSET_PX + 40 }) as DOMRect;

    expect(
      resolveActiveCategoryId([
        { id: "c1", name: "One" },
        { id: "c2", name: "Two" },
        { id: "c3", name: "Three" },
      ]),
    ).toBe("c2");
  });
});

describe("CategoryNav", () => {
  it("renders one anchor link per category pointing to its section", () => {
    render(
      <CategoryNav
        ariaLabel={testMenuUiLabels.categoryNavAria}
        categories={[
          { id: "c1", name: "Signature" },
          { id: "c2", name: "Breakfast" },
        ]}
      />,
    );

    const signature = screen.getByRole("link", { name: "Signature" });
    const breakfast = screen.getByRole("link", { name: "Breakfast" });
    expect(signature).toHaveAttribute("href", "#category-c1");
    expect(breakfast).toHaveAttribute("href", "#category-c2");
  });

  it("marks the first category as active by default", () => {
    render(
      <CategoryNav
        ariaLabel={testMenuUiLabels.categoryNavAria}
        categories={[
          { id: "c1", name: "Signature" },
          { id: "c2", name: "Breakfast" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Signature" })).toHaveClass(
      "menu-category-pill--active",
    );
    expect(screen.getByRole("link", { name: "Breakfast" })).toHaveClass(
      "menu-category-pill--inactive",
    );
    expect(screen.getByRole("link", { name: "Signature" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  it("renders nothing when there are no categories", () => {
    const { container } = render(
      <CategoryNav ariaLabel={testMenuUiLabels.categoryNavAria} categories={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
