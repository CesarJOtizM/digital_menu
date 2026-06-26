import { describe, it, expect } from "vitest";
import { safeLoadConfig } from "./safe-load-config";
import { DEFAULT_DEPLOY_CONFIG } from "./settings-config-mapper";
import type { DeployConfig } from "@/config/domain/deploy-config";

/**
 * safeLoadConfig wraps a config loader so an unreachable/unconfigured settings
 * store (e.g. no DB at build-time prerender) degrades to defaults instead of
 * crashing the render. This is the same "sane defaults" guarantee the spec
 * requires when the Settings row is absent, extended to load failures.
 */
const customConfig: DeployConfig = {
  ...DEFAULT_DEPLOY_CONFIG,
  restaurantName: "Loaded Restaurant",
  primaryColor: "#abcdef",
};

describe("safeLoadConfig", () => {
  it("returns the loaded config when the loader succeeds", async () => {
    const result = await safeLoadConfig(async () => customConfig);
    expect(result).toEqual(customConfig);
  });

  it("falls back to defaults when the loader throws (DB unreachable)", async () => {
    const result = await safeLoadConfig(async () => {
      throw new Error("ECONNREFUSED");
    });
    expect(result).toEqual(DEFAULT_DEPLOY_CONFIG);
  });

  it("does not swallow the loaded value's fields on success", async () => {
    const result = await safeLoadConfig(async () => customConfig);
    expect(result.restaurantName).toBe("Loaded Restaurant");
    expect(result.primaryColor).toBe("#abcdef");
  });
});
