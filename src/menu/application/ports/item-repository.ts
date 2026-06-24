import type { Item } from "../../domain/entities/item";

/**
 * Driven port for Item persistence. The domain/application layer depends on this
 * abstraction; infrastructure provides the Prisma adapter (PR3 / Slice 2b).
 */
export interface ItemRepository {
  findById(id: string): Promise<Item | null>;
  save(item: Item): Promise<void>;
}
