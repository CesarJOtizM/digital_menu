/**
 * Per-deploy single-tenant configuration. Represents branding, money formatting,
 * and locale/timezone for ONE restaurant deploy. There is NO tenantId and no
 * per-tenant lookup — a deploy serves exactly one restaurant.
 */
export interface DeployConfig {
  /** Display name of the restaurant. */
  readonly restaurantName: string;
  /** Resolved logo source (url or stored path), or null when unset. */
  readonly logo: string | null;
  /** Primary brand color (drives the menu accent theme). */
  readonly primaryColor: string;
  /** Secondary brand color (falls back to primary when unset). */
  readonly secondaryColor: string;
  /** ISO 4217 currency code used for price formatting. */
  readonly currency: string;
  /** BCP 47 locale used for number/price formatting. */
  readonly locale: string;
  /** IANA timezone used for availability resolution. */
  readonly timezone: string;
  /** When false, prices render as bare numbers (Azahar-style). */
  readonly showCurrencySymbol: boolean;
  /** When true, the root route renders a landing page instead of redirecting. */
  readonly landingEnabled: boolean;
}
