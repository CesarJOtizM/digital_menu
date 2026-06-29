import { describe, expect, it } from "vitest";
import {
  localizedDescription,
  localizedName,
} from "./localize-menu-content";

describe("localize-menu-content", () => {
  it("localizes names and descriptions with English fallback", () => {
    const item = {
      name: "Croquetas",
      nameEn: "Croquettes",
      description: "Clásicas",
      descriptionEn: "Classic",
    };

    expect(localizedName(item, "en")).toBe("Croquettes");
    expect(localizedDescription(item, "en")).toBe("Classic");
    expect(localizedName(item, "es")).toBe("Croquetas");
  });
});
