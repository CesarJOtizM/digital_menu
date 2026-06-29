import type { Category } from "../../domain/entities/category";
import type { Item } from "../../domain/entities/item";
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
  /** The menu used for admin edits (published first, else most recently updated). */
  findForAdmin(): Promise<Menu | null>;
  /** Persist the whole aggregate atomically (upsert). */
  save(menu: Menu): Promise<void>;
  /** Update category display order without rewriting item subtrees. */
  updateCategoryOrder(menuId: string, orderedCategoryIds: readonly string[]): Promise<void>;
  /** Update item display order within a category. */
  updateItemOrder(categoryId: string, orderedItemIds: readonly string[]): Promise<void>;
  /** Toggle item visibility without rewriting the item subtree. */
  updateItemActive(categoryId: string, itemId: string, active: boolean): Promise<void>;
  /** Upsert a single category row without touching its items. */
  upsertCategory(menuId: string, category: Category): Promise<void>;
  /** Delete a category and cascade its items. */
  deleteCategoryById(categoryId: string): Promise<void>;
  /** Persist one item subtree within a category. */
  saveItem(categoryId: string, item: Item): Promise<void>;
  /** Delete one item and cascade its children. */
  deleteItemById(itemId: string): Promise<void>;
}
