import type { User } from "@supabase/supabase-js";

export const DEV_BYPASS_COOKIE = "digital-menu-dev-auth";
export const DEV_BYPASS_COOKIE_VALUE = "1";

export interface DevBypassConfig {
  email: string;
  password: string;
}

function isTruthyEnv(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

/** Dev-only bypass; never enabled in production. */
export function getDevBypassConfig(): DevBypassConfig | null {
  if (process.env.NODE_ENV === "production") return null;
  if (!isTruthyEnv(process.env.AUTH_DEV_BYPASS)) return null;

  const email = process.env.AUTH_DEV_BYPASS_EMAIL?.trim();
  const password = process.env.AUTH_DEV_BYPASS_PASSWORD;

  if (!email || !password) return null;

  return { email, password };
}

export function isDevBypassAvailable(): boolean {
  return getDevBypassConfig() !== null;
}

export function matchesDevBypassCredentials(
  email: string,
  password: string,
  config: DevBypassConfig,
): boolean {
  return email === config.email && password === config.password;
}

export function hasDevBypassCookieValue(value: string | undefined): boolean {
  return value === DEV_BYPASS_COOKIE_VALUE && isDevBypassAvailable();
}

export function createDevBypassUser(email: string): User {
  return {
    id: "dev-bypass",
    aud: "authenticated",
    role: "authenticated",
    email,
    email_confirmed_at: new Date().toISOString(),
    phone: "",
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: "dev-bypass" },
    user_metadata: { dev_bypass: true },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_anonymous: false,
  };
}

export const devBypassCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24,
};
