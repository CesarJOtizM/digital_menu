import type { Menu } from "../../domain/entities/menu";

/**
 * Driven port for the Menu aggregate. The aggregate (Menu -> ordered Categories
 * -> ordered Items -> Variants / ModifierGroups / Options) is the consistency
 * boundary, so the repository loads and persists it as a whole. Infrastructure
 * provides the Prisma adapter (PR3 / Slice 2b). Single-tenant: no brand/tenant
 * scoping on any signature.
 */
export interface MenuRepository {
  findById(id: string): Promise<Menu | null>;
  findBySlug(slug: string): Promise<Menu | null>;
  /** The single published menu for this deploy, if any. */
  findPublished(): Promise<Menu | null>;
  /** Persist the whole aggregate atomically (upsert). */
  save(menu: Menu): Promise<void>;
}
