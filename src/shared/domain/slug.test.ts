import { describe, it, expect } from "vitest";
import { Slug } from "./slug";
import { InvalidSlug } from "./errors";

describe("Slug", () => {
  describe("fromName", () => {
    it("lowercases and hyphenates a simple name", () => {
      expect(Slug.fromName("Grilled Chicken").value).toBe("grilled-chicken");
    });

    it("strips diacritics", () => {
      expect(Slug.fromName("Café Crème").value).toBe("cafe-creme");
    });

    it("removes special characters", () => {
      expect(Slug.fromName("Pizza & Pasta!").value).toBe("pizza-pasta");
    });

    it("collapses multiple separators into a single hyphen", () => {
      expect(Slug.fromName("Soup   of __ the Day").value).toBe(
        "soup-of-the-day",
      );
    });

    it("trims leading and trailing hyphens", () => {
      expect(Slug.fromName("--Special--").value).toBe("special");
    });

    it("throws when normalization yields an empty slug", () => {
      expect(() => Slug.fromName("!!!")).toThrow(InvalidSlug);
    });
  });

  describe("fromExisting", () => {
    it("preserves an already-normalized value verbatim", () => {
      expect(Slug.fromExisting("house-burger").value).toBe("house-burger");
    });
  });

  describe("withSuffix", () => {
    it("appends a numeric suffix for de-duplication", () => {
      expect(Slug.fromName("Lemonade").withSuffix(2).value).toBe("lemonade-2");
    });
  });

  describe("equals", () => {
    it("is true for the same value and false otherwise", () => {
      expect(Slug.fromName("Tea").equals(Slug.fromName("Tea"))).toBe(true);
      expect(Slug.fromName("Tea").equals(Slug.fromName("Coffee"))).toBe(false);
    });
  });
});
