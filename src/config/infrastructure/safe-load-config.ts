import type { DeployConfig } from "@/config/domain/deploy-config";
import { DEFAULT_DEPLOY_CONFIG } from "./settings-config-mapper";

/**
 * Runs a config `loader` and degrades to {@link DEFAULT_DEPLOY_CONFIG} if it
 * throws. A settings store that is unreachable (no DB during static prerender)
 * or unconfigured must NOT crash the render — the deploy falls back to defaults,
 * the same guarantee as an absent Settings row.
 */
export async function safeLoadConfig(
  loader: () => Promise<DeployConfig>,
): Promise<DeployConfig> {
  try {
    return await loader();
  } catch {
    return DEFAULT_DEPLOY_CONFIG;
  }
}
