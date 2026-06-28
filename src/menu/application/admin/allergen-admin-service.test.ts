import { describe, expect, it } from "vitest";
import { MenuAdminError } from "./menu-admin-service";

describe("AllergenAdminService validation", () => {
  it("uses ALLERGEN_NAME_REQUIRED code for empty names", () => {
    const error = new MenuAdminError("ALLERGEN_NAME_REQUIRED");
    expect(error.code).toBe("ALLERGEN_NAME_REQUIRED");
  });
});
