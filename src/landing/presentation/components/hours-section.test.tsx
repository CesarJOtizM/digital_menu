// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HoursSection } from "./hours-section";

describe("HoursSection", () => {
  it("renders the heading and each day with its hours", () => {
    render(
      <HoursSection
        hours={{
          heading: "Horarios",
          rows: [
            { day: "Mar–Jue", hours: "13–23" },
            { day: "Vie–Sab", hours: "13–00" },
          ],
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Horarios" })).toBeInTheDocument();
    expect(screen.getByText("Mar–Jue")).toBeInTheDocument();
    expect(screen.getByText("13–23")).toBeInTheDocument();
    expect(screen.getByText("Vie–Sab")).toBeInTheDocument();
    expect(screen.getByText("13–00")).toBeInTheDocument();
  });
});
