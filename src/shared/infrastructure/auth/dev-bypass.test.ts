import { afterEach, describe, expect, it } from "vitest";
import {
  createDevBypassUser,
  getDevBypassConfig,
  hasDevBypassCookieValue,
  isDevBypassAvailable,
  matchesDevBypassCredentials,
} from "./dev-bypass";

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

describe("getDevBypassConfig", () => {
  it("returns null in production even when bypass env is set", () => {
    process.env.NODE_ENV = "production";
    process.env.AUTH_DEV_BYPASS = "true";
    process.env.AUTH_DEV_BYPASS_EMAIL = "dev@test.local";
    process.env.AUTH_DEV_BYPASS_PASSWORD = "secret";

    expect(getDevBypassConfig()).toBeNull();
    expect(isDevBypassAvailable()).toBe(false);
  });

  it("returns config when enabled outside production", () => {
    process.env.NODE_ENV = "development";
    process.env.AUTH_DEV_BYPASS = "true";
    process.env.AUTH_DEV_BYPASS_EMAIL = "dev@test.local";
    process.env.AUTH_DEV_BYPASS_PASSWORD = "secret";

    expect(getDevBypassConfig()).toEqual({
      email: "dev@test.local",
      password: "secret",
    });
  });

  it("returns null when bypass flag is not true", () => {
    process.env.NODE_ENV = "development";
    process.env.AUTH_DEV_BYPASS = "false";

    expect(getDevBypassConfig()).toBeNull();
  });
});

describe("matchesDevBypassCredentials", () => {
  const config = { email: "dev@test.local", password: "secret" };

  it("admits matching email and password", () => {
    expect(matchesDevBypassCredentials("dev@test.local", "secret", config)).toBe(
      true,
    );
  });

  it("rejects wrong password", () => {
    expect(matchesDevBypassCredentials("dev@test.local", "wrong", config)).toBe(
      false,
    );
  });
});

describe("hasDevBypassCookieValue", () => {
  it("accepts the bypass cookie when bypass is enabled", () => {
    process.env.NODE_ENV = "development";
    process.env.AUTH_DEV_BYPASS = "true";
    process.env.AUTH_DEV_BYPASS_EMAIL = "dev@test.local";
    process.env.AUTH_DEV_BYPASS_PASSWORD = "secret";

    expect(hasDevBypassCookieValue("1")).toBe(true);
  });

  it("rejects cookie when bypass is disabled", () => {
    process.env.NODE_ENV = "development";
    process.env.AUTH_DEV_BYPASS = "false";

    expect(hasDevBypassCookieValue("1")).toBe(false);
  });
});

describe("createDevBypassUser", () => {
  it("builds a user with the configured email", () => {
    const user = createDevBypassUser("dev@test.local");
    expect(user.email).toBe("dev@test.local");
    expect(user.id).toBe("dev-bypass");
  });
});
