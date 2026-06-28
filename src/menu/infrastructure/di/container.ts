import type { PrismaClient } from "@prisma/client";
import { createImageStorage } from "@/shared/infrastructure/storage/create-image-storage";
import { LoggingEventDispatcher } from "@/shared/infrastructure/events";
import type { ImageStoragePort, EventDispatcher } from "@/shared/domain/ports";
import type { MenuRepository } from "@/menu/application/ports/menu-repository";
import type { ItemRepository } from "@/menu/application/ports/item-repository";
import type { IdGenerator } from "@/menu/application/ports/id-generator";
import { CopyModifiersFromItem } from "@/menu/application/use-cases/copy-modifiers-from-item";
import {
  PrismaMenuRepository,
  PrismaItemRepository,
  CuidIdGenerator,
} from "@/menu/infrastructure/persistence";

/**
 * Manual DI factory (composition root) for the Menu bounded context. Wires the
 * Prisma persistence adapters and use-cases for downstream slices. Single-tenant:
 * the container holds no brand/tenant context.
 */
export interface MenuContainer {
  readonly imageStorage: ImageStoragePort;
  readonly eventDispatcher: EventDispatcher;
  readonly menuRepository: MenuRepository;
  readonly itemRepository: ItemRepository;
  readonly idGenerator: IdGenerator;
  readonly copyModifiersFromItem: CopyModifiersFromItem;
}

export function createMenuContainer(client: PrismaClient): MenuContainer {
  const imageStorage = createImageStorage();
  const eventDispatcher = new LoggingEventDispatcher();

  const menuRepository = new PrismaMenuRepository(client);
  const itemRepository = new PrismaItemRepository(client);
  const idGenerator = new CuidIdGenerator();

  const copyModifiersFromItem = new CopyModifiersFromItem(itemRepository, idGenerator);

  return {
    imageStorage,
    eventDispatcher,
    menuRepository,
    itemRepository,
    idGenerator,
    copyModifiersFromItem,
  };
}
