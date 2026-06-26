import "server-only";

import type { PrismaClient } from "@prisma/client";
import type { DeployConfig } from "@/config/domain/deploy-config";
import type { ConfigPort } from "@/config/application/ports/config-port";
import { mapSettingsRowToConfig } from "./settings-config-mapper";

/** The single Settings row id. Single-tenant: there is exactly one. */
const SETTINGS_SINGLETON_ID = "default";

/**
 * Prisma adapter for {@link ConfigPort}. Reads the Settings singleton by its
 * fixed id ("default") — NO tenant/brand lookup — and maps it to a
 * {@link DeployConfig}, falling back to defaults when the row is absent.
 */
export class PrismaConfigRepository implements ConfigPort {
  constructor(private readonly client: PrismaClient) {}

  async load(): Promise<DeployConfig> {
    const row = await this.client.settings.findUnique({
      where: { id: SETTINGS_SINGLETON_ID },
    });
    return mapSettingsRowToConfig(row);
  }
}
