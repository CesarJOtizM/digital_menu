import { describe, it, expect } from "vitest";
import { Allergen } from "./allergen";
import { Slug } from "@/shared/domain";

describe("Allergen", () => {
  it("is a reference vocabulary entry with id, name, slug and optional icon", () => {
    const allergen = Allergen.create({
      id: "alg-1",
      name: "Gluten",
      slug: Slug.fromName("Gluten"),
      icon: "wheat",
    });
    expect(allergen.id).toBe("alg-1");
    expect(allergen.name).toBe("Gluten");
    expect(allergen.slug.value).toBe("gluten");
    expect(allergen.icon).toBe("wheat");
  });

  it("allows the icon to be omitted", () => {
    const allergen = Allergen.create({
      id: "alg-2",
      name: "Dairy",
      slug: Slug.fromName("Dairy"),
    });
    expect(allergen.icon).toBeUndefined();
  });

  it("is identified by id (aggregate identity)", () => {
    const a = Allergen.create({ id: "alg-1", name: "Gluten", slug: Slug.fromName("Gluten") });
    const b = Allergen.create({ id: "alg-1", name: "Different", slug: Slug.fromName("X") });
    expect(a.equals(b)).toBe(true);
  });

  it("is not equal to an allergen with a different id", () => {
    const a = Allergen.create({ id: "alg-1", name: "Gluten", slug: Slug.fromName("Gluten") });
    const b = Allergen.create({ id: "alg-2", name: "Gluten", slug: Slug.fromName("Gluten") });
    expect(a.equals(b)).toBe(false);
  });
});
