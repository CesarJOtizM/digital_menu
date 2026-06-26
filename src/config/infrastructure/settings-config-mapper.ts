import type { DeployConfig } from "@/config/domain/deploy-config";

/**
 * Structural shape of the persisted Settings singleton row (mirrors the Prisma
 * `Settings` model). Declared as a plain type so the mapper stays PURE and unit
 * testable without the generated Prisma client or a live database. The real
 * Prisma row is assignable to this.
 */
export interface SettingsRow {
  id: string;
  restaurantName: string;
  logoUrl: string | null;
  logoPath: string | null;
  primaryColor: string;
  secondaryColor: string | null;
  currency: string;
  locale: string;
  timezone: string;
  showCurrencySymbol: boolean;
  landing: unknown;
}

/**
 * Sane defaults used before any Settings row is saved, so the app renders on a
 * fresh deploy. Locale/currency are neutral (en-US/USD) and MUST be overridden
 * per deploy via the Settings singleton — never hardcoded downstream.
 */
export const DEFAULT_DEPLOY_CONFIG: DeployConfig = {
  restaurantName: "Digital Menu",
  logo: null,
  primaryColor: "#0f766e",
  secondaryColor: "#0f766e",
  currency: "USD",
  locale: "en-US",
  timezone: "UTC",
  showCurrencySymbol: true,
  landingEnabled: false,
};

function resolveLogo(row: SettingsRow): string | null {
  return row.logoUrl ?? row.logoPath ?? null;
}

function resolveLandingEnabled(landing: unknown): boolean {
  return (
    typeof landing === "object" &&
    landing !== null &&
    "enabled" in landing &&
    (landing as { enabled: unknown }).enabled === true
  );
}

/**
 * Maps the persisted Settings singleton to the {@link DeployConfig} value
 * object. When `row` is null (settings not yet saved) it returns
 * {@link DEFAULT_DEPLOY_CONFIG}. Single-tenant: there is exactly one row.
 */
export function mapSettingsRowToConfig(row: SettingsRow | null): DeployConfig {
  if (row === null) {
    return DEFAULT_DEPLOY_CONFIG;
  }

  return {
    restaurantName: row.restaurantName,
    logo: resolveLogo(row),
    primaryColor: row.primaryColor,
    secondaryColor: row.secondaryColor ?? row.primaryColor,
    currency: row.currency,
    locale: row.locale,
    timezone: row.timezone,
    showCurrencySymbol: row.showCurrencySymbol,
    landingEnabled: resolveLandingEnabled(row.landing),
  };
}
