import type { PrismaClient } from "@prisma/client";
import { LocalImageStorage } from "@/shared/infrastructure/storage";
import { LoggingEventDispatcher } from "@/shared/infrastructure/events";
import type { ImageStoragePort, EventDispatcher } from "@/shared/domain/ports";

/**
 * Manual DI factory for the Menu bounded context.
 *
 * This is the composition-root shell established in PR1. Menu use-cases and
 * repositories are wired in later slices (PR2/PR3); for now the container only
 * exposes shared infrastructure adapters so downstream slices have a stable
 * factory to extend.
 */
export interface MenuContainer {
  readonly imageStorage: ImageStoragePort;
  readonly eventDispatcher: EventDispatcher;
}

export function createMenuContainer(_client: PrismaClient): MenuContainer {
  const imageStorage = new LocalImageStorage();
  const eventDispatcher = new LoggingEventDispatcher();

  return {
    imageStorage,
    eventDispatcher,
  };
}
