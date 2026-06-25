import { describe, it, expect } from "vitest";
import { resolveSignIn } from "./auth-config";

describe("resolveSignIn", () => {
  it("admits a sign-in when the account email is on the allowlist", () => {
    expect(
      resolveSignIn(
        { email: "owner@example.com" },
        "owner@example.com,manager@example.com",
      ),
    ).toBe(true);
  });

  it("rejects a sign-in when the account email is not on the allowlist", () => {
    expect(
      resolveSignIn({ email: "intruder@evil.com" }, "owner@example.com"),
    ).toBe(false);
  });

  it("matches case-insensitively against the allowlist env string", () => {
    expect(
      resolveSignIn({ email: "Owner@Example.COM" }, "owner@example.com"),
    ).toBe(true);
  });

  it("rejects when the profile has no email", () => {
    expect(resolveSignIn({ email: null }, "owner@example.com")).toBe(false);
  });

  it("rejects when the profile is undefined", () => {
    expect(resolveSignIn(undefined, "owner@example.com")).toBe(false);
  });

  it("rejects everyone when the allowlist env is empty", () => {
    expect(resolveSignIn({ email: "owner@example.com" }, "")).toBe(false);
  });

  it("rejects everyone when the allowlist env is undefined", () => {
    expect(resolveSignIn({ email: "owner@example.com" }, undefined)).toBe(
      false,
    );
  });
});
