import { describe, it, expect } from "vitest";
import { isEmailAllowed, parseAllowedEmails } from "./is-email-allowed";

describe("parseAllowedEmails", () => {
  it("splits a comma-separated string into a normalized list", () => {
    expect(parseAllowedEmails("a@x.com,b@y.com")).toEqual([
      "a@x.com",
      "b@y.com",
    ]);
  });

  it("trims surrounding whitespace around each entry", () => {
    expect(parseAllowedEmails(" a@x.com , b@y.com ")).toEqual([
      "a@x.com",
      "b@y.com",
    ]);
  });

  it("lowercases every entry for case-insensitive matching", () => {
    expect(parseAllowedEmails("Owner@Example.COM")).toEqual([
      "owner@example.com",
    ]);
  });

  it("drops empty entries produced by trailing or double commas", () => {
    expect(parseAllowedEmails("a@x.com,,b@y.com,")).toEqual([
      "a@x.com",
      "b@y.com",
    ]);
  });

  it("returns an empty list for an empty string", () => {
    expect(parseAllowedEmails("")).toEqual([]);
  });

  it("returns an empty list for undefined", () => {
    expect(parseAllowedEmails(undefined)).toEqual([]);
  });

  it("returns an empty list for a whitespace-only string", () => {
    expect(parseAllowedEmails("   ")).toEqual([]);
  });
});

describe("isEmailAllowed", () => {
  it("admits an email that is present in the allowlist", () => {
    expect(isEmailAllowed("owner@example.com", ["owner@example.com"])).toBe(
      true,
    );
  });

  it("rejects an email that is not in the allowlist", () => {
    expect(isEmailAllowed("intruder@evil.com", ["owner@example.com"])).toBe(
      false,
    );
  });

  it("matches case-insensitively on the email", () => {
    expect(isEmailAllowed("Owner@Example.COM", ["owner@example.com"])).toBe(
      true,
    );
  });

  it("matches case-insensitively on the allowlist entry", () => {
    expect(isEmailAllowed("owner@example.com", ["Owner@Example.COM"])).toBe(
      true,
    );
  });

  it("trims surrounding whitespace on the email before matching", () => {
    expect(isEmailAllowed("  owner@example.com  ", ["owner@example.com"])).toBe(
      true,
    );
  });

  it("rejects every email when the allowlist is empty", () => {
    expect(isEmailAllowed("owner@example.com", [])).toBe(false);
  });

  it("rejects a null email", () => {
    expect(isEmailAllowed(null, ["owner@example.com"])).toBe(false);
  });

  it("rejects an undefined email", () => {
    expect(isEmailAllowed(undefined, ["owner@example.com"])).toBe(false);
  });

  it("rejects an empty-string email", () => {
    expect(isEmailAllowed("", ["owner@example.com"])).toBe(false);
  });

  it("rejects a whitespace-only email", () => {
    expect(isEmailAllowed("   ", ["owner@example.com"])).toBe(false);
  });

  it("selects the matching entry among several allowlist entries", () => {
    expect(
      isEmailAllowed("second@example.com", [
        "first@example.com",
        "second@example.com",
        "third@example.com",
      ]),
    ).toBe(true);
  });
});
