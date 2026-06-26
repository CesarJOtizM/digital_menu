import type { DeployConfig } from "@/config/domain/deploy-config";

/**
 * Driven port for loading the per-deploy {@link DeployConfig}. Single-tenant:
 * `load()` takes NO tenant/brand argument — it reads the one Settings singleton.
 */
export interface ConfigPort {
  load(): Promise<DeployConfig>;
}
