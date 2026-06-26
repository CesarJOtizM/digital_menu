import "server-only";

import { cache } from "react";
import type { DeployConfig } from "@/config/domain/deploy-config";
import { prisma } from "@/shared/infrastructure/prisma/client";
import { PrismaConfigRepository } from "./prisma-config-repository";
import { safeLoadConfig } from "./safe-load-config";

/**
 * Loads the per-deploy {@link DeployConfig} from the Settings singleton.
 *
 * Wrapped in React `cache` so repeated calls within a single server request
 * (layout + page + components) hit the database at most once. Single-tenant:
 * reads the `id="default"` row only — there is NO tenant resolution.
 *
 * Degrades to defaults if the store is unreachable (e.g. no DB during static
 * prerender), so the app always renders.
 */
export const getConfig = cache((): Promise<DeployConfig> => {
  const repository = new PrismaConfigRepository(prisma);
  return safeLoadConfig(() => repository.load());
});
