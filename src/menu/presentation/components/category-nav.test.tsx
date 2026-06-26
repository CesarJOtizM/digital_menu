// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryNav } from "./category-nav";

describe("CategoryNav", () => {
  it("renders one anchor link per category pointing to its section", () => {
    render(
      <CategoryNav
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

  it("renders nothing when there are no categories", () => {
    const { container } = render(<CategoryNav categories={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
