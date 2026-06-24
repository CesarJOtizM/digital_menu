import { describe, it, expect } from "vitest";
import { ImageSource } from "./image-source";

describe("ImageSource", () => {
  describe("local", () => {
    it("builds a local source carrying the given path", () => {
      const source = ImageSource.local("/uploads/items/burger.jpg");
      expect(source.type).toBe("local");
      expect(source.url).toBe("/uploads/items/burger.jpg");
    });
  });

  describe("external", () => {
    it("builds an external source carrying the given url", () => {
      const source = ImageSource.external("https://cdn.example.com/x.jpg");
      expect(source.type).toBe("external");
      expect(source.url).toBe("https://cdn.example.com/x.jpg");
    });
  });

  describe("placeholder", () => {
    it("builds a placeholder source", () => {
      const source = ImageSource.placeholder();
      expect(source.type).toBe("placeholder");
      expect(source.url).toBe("/placeholder.svg");
    });
  });

  describe("resolve", () => {
    it("prefers a local path when present", () => {
      const source = ImageSource.resolve("/uploads/items/a.jpg", "https://x/a");
      expect(source.type).toBe("local");
      expect(source.url).toBe("/uploads/items/a.jpg");
    });

    it("falls back to an external url when no path", () => {
      const source = ImageSource.resolve(null, "https://x/a.jpg");
      expect(source.type).toBe("external");
      expect(source.url).toBe("https://x/a.jpg");
    });

    it("falls back to placeholder when neither is present", () => {
      const source = ImageSource.resolve(null, undefined);
      expect(source.type).toBe("placeholder");
    });
  });

  describe("equals", () => {
    it("is true for the same type and url", () => {
      expect(
        ImageSource.local("/a").equals(ImageSource.local("/a")),
      ).toBe(true);
    });

    it("is false when type or url differ", () => {
      expect(
        ImageSource.local("/a").equals(ImageSource.external("/a")),
      ).toBe(false);
    });
  });
});
