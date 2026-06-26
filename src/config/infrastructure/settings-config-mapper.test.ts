import { describe, it, expect } from "vitest";
import {
  mapSettingsRowToConfig,
  DEFAULT_DEPLOY_CONFIG,
} from "./settings-config-mapper";
import type { SettingsRow } from "./settings-config-mapper";

/**
 * Pure mapping from the persisted Settings singleton row to the DeployConfig
 * value object. Single-tenant: there is exactly one row (id="default"), NO
 * tenant lookup. When the row is absent the mapper returns sane defaults so the
 * app renders before any settings are saved.
 */
function fullRow(): SettingsRow {
  return {
    id: "default",
    restaurantName: "Cafe Azahar",
    logoUrl: "https://cdn.example.com/logo.png",
    logoPath: null,
    primaryColor: "#0f766e",
    secondaryColor: "#f59e0b",
    currency: "ARS",
    locale: "es-AR",
    timezone: "America/Argentina/Buenos_Aires",
    showCurrencySymbol: false,
    landing: { enabled: true },
  };
}

describe("mapSettingsRowToConfig", () => {
  describe("with a populated row", () => {
    it("maps branding fields from the row", () => {
      const config = mapSettingsRowToConfig(fullRow());
      expect(config.restaurantName).toBe("Cafe Azahar");
      expect(config.primaryColor).toBe("#0f766e");
      expect(config.secondaryColor).toBe("#f59e0b");
    });

    it("maps the logo from logoUrl when present", () => {
      const config = mapSettingsRowToConfig(fullRow());
      expect(config.logo).toBe("https://cdn.example.com/logo.png");
    });

    it("maps currency, locale, and timezone", () => {
      const config = mapSettingsRowToConfig(fullRow());
      expect(config.currency).toBe("ARS");
      expect(config.locale).toBe("es-AR");
      expect(config.timezone).toBe("America/Argentina/Buenos_Aires");
    });

    it("maps the currency-symbol toggle (Azahar bare-number mode)", () => {
      const config = mapSettingsRowToConfig(fullRow());
      expect(config.showCurrencySymbol).toBe(false);
    });

    it("reads landingEnabled from the landing JSON blob", () => {
      const config = mapSettingsRowToConfig(fullRow());
      expect(config.landingEnabled).toBe(true);
    });

    it("falls back to logoPath when logoUrl is absent", () => {
      const row: SettingsRow = {
        ...fullRow(),
        logoUrl: null,
        logoPath: "/uploads/logo.png",
      };
      const config = mapSettingsRowToConfig(row);
      expect(config.logo).toBe("/uploads/logo.png");
    });

    it("yields a null logo when neither logoUrl nor logoPath is set", () => {
      const row: SettingsRow = { ...fullRow(), logoUrl: null, logoPath: null };
      expect(mapSettingsRowToConfig(row).logo).toBeNull();
    });

    it("falls back secondaryColor to primaryColor when null", () => {
      const row: SettingsRow = { ...fullRow(), secondaryColor: null };
      const config = mapSettingsRowToConfig(row);
      expect(config.secondaryColor).toBe(config.primaryColor);
    });

    it("treats landingEnabled false when landing blob is null", () => {
      const row: SettingsRow = { ...fullRow(), landing: null };
      expect(mapSettingsRowToConfig(row).landingEnabled).toBe(false);
    });

    it("treats landingEnabled false when landing blob lacks enabled flag", () => {
      const row: SettingsRow = { ...fullRow(), landing: { hero: "x" } };
      expect(mapSettingsRowToConfig(row).landingEnabled).toBe(false);
    });
  });

  describe("with no row (settings not yet saved)", () => {
    it("returns the default deploy config", () => {
      const config = mapSettingsRowToConfig(null);
      expect(config).toEqual(DEFAULT_DEPLOY_CONFIG);
    });

    it("defaults to symbol-visible, no logo, and landing disabled", () => {
      const config = mapSettingsRowToConfig(null);
      expect(config.showCurrencySymbol).toBe(true);
      expect(config.logo).toBeNull();
      expect(config.landingEnabled).toBe(false);
    });

    it("provides a non-empty restaurant name and a primary color default", () => {
      const config = mapSettingsRowToConfig(null);
      expect(config.restaurantName.length).toBeGreaterThan(0);
      expect(config.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});
