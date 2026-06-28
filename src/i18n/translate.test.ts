import { describe, expect, it } from "vitest";
import { createTranslator, getMessages, pluralize, resolveAdminError } from "./translate";

describe("i18n translate", () => {
  it("resolves nested keys in Spanish", () => {
    const t = createTranslator(getMessages("es"));
    expect(t("login.title")).toBe("Iniciar sesión");
  });

  it("resolves nested keys in English", () => {
    const t = createTranslator(getMessages("en"));
    expect(t("login.title")).toBe("Sign in");
  });

  it("interpolates parameters", () => {
    const t = createTranslator(getMessages("en"));
    expect(t("menu.metaDescription", { restaurant: "Azahar" })).toContain("Azahar");
  });

  it("returns the key when missing", () => {
    const t = createTranslator(getMessages("es"));
    expect(t("missing.key")).toBe("missing.key");
  });

  it("pluralizes one/other pairs", () => {
    expect(pluralize(1, "plato", "platos")).toBe("plato");
    expect(pluralize(3, "item", "items")).toBe("items");
  });

  it("resolves admin error codes", () => {
    const t = createTranslator(getMessages("es"));
    expect(resolveAdminError(t, "PRICE_REQUIRED")).toBe("Precio requerido");
    expect(resolveAdminError(t, "UNKNOWN")).toBe(
      "Ocurrió un error. Intenta de nuevo.",
    );
  });
});
