// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SocialLinks } from "./social-links";

describe("SocialLinks", () => {
  it("renders one link per social entry with its href", () => {
    render(
      <SocialLinks
        links={[
          { label: "Instagram", url: "https://instagram.com/azahar" },
          { label: "WhatsApp", url: "https://wa.me/123" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://instagram.com/azahar",
    );
    expect(screen.getByRole("link", { name: "WhatsApp" })).toHaveAttribute(
      "href",
      "https://wa.me/123",
    );
  });

  it("renders nothing when there are no links", () => {
    const { container } = render(<SocialLinks links={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
