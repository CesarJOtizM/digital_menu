import { IMAGE_SOURCE_TYPE, ImageSource, Price, Slug } from "@/shared/domain";
import type { ImageStoragePort } from "@/shared/domain/ports";
import type { ModifierGroup, Variant } from "@/menu/domain";
import type { Menu } from "@/menu/domain";
import { Category, Item } from "@/menu/domain";
import type { MenuRepository } from "../ports/menu-repository";
import { DuplicatePosition } from "@/menu/domain/errors";
import type { IdGenerator } from "../ports/id-generator";

export class MenuAdminError extends Error {
  readonly code: string;
  readonly params?: Readonly<Record<string, string | number>>;

  constructor(code: string, params?: Readonly<Record<string, string | number>>) {
    super(code);
    this.code = code;
    this.params = params;
    this.name = "MenuAdminError";
  }
}

export interface ItemInput {
  name: string;
  nameEn?: string | null;
  description: string;
  descriptionEn?: string | null;
  priceCentavos: number;
  active: boolean;
  variants: Variant[];
  modifierGroups: ModifierGroup[];
  imageSource: ImageSource;
  allergenIds: string[];
}

export interface CategoryInput {
  name: string;
  nameEn?: string | null;
}

export class MenuAdminService {
  constructor(
    private readonly menus: MenuRepository,
    private readonly ids: IdGenerator,
    private readonly images: ImageStoragePort,
  ) {}

  async loadMenu(): Promise<Menu> {
    const menu = await this.menus.findForAdmin();
    if (!menu) {
      throw new MenuAdminError("NO_MENU");
    }
    return menu;
  }

  async toggleItemActive(categoryId: string, itemId: string): Promise<void> {
    const menu = await this.loadMenu();
    const item = this.requireItem(menu, categoryId, itemId);
    await this.menus.updateItemActive(categoryId, itemId, !item.active);
  }

  async saveItem(
    categoryId: string,
    itemId: string | null,
    input: ItemInput,
  ): Promise<string> {
    const menu = await this.loadMenu();
    const category = this.requireCategory(menu, categoryId);
    const details = {
      name: input.name.trim(),
      nameEn: input.nameEn ?? null,
      description: input.description.trim(),
      descriptionEn: input.descriptionEn ?? null,
      basePrice: Price.create(input.priceCentavos),
      active: input.active,
      variants: input.variants,
      modifierGroups: input.modifierGroups,
      imageSource: input.imageSource,
      allergenIds: input.allergenIds,
    };

    if (itemId) {
      const existing = this.requireItem(menu, categoryId, itemId);
      const slug =
        existing.name === details.name
          ? existing.slug
          : Slug.fromName(details.name);
      const updated = existing.withDetails({ ...details, slug });

      await this.menus.saveItem(categoryId, updated);
      return updated.id;
    }

    const newItem = Item.create({
      id: this.ids.next(),
      name: details.name,
      nameEn: details.nameEn,
      slug: Slug.fromName(details.name),
      description: details.description,
      descriptionEn: details.descriptionEn,
      basePrice: details.basePrice,
      imageSource: details.imageSource,
      active: details.active,
      position: category.items.length,
      allergenIds: details.allergenIds,
      variants: details.variants,
      modifierGroups: details.modifierGroups,
    });

    await this.menus.saveItem(categoryId, newItem);
    return newItem.id;
  }

  async deleteItem(categoryId: string, itemId: string): Promise<void> {
    const menu = await this.loadMenu();
    const existing = this.requireItem(menu, categoryId, itemId);

    if (existing.imageSource.type !== IMAGE_SOURCE_TYPE.PLACEHOLDER) {
      await this.images.delete(existing.imageSource.url).catch(() => undefined);
    }

    await this.menus.deleteItemById(itemId);
  }

  async saveCategory(
    categoryId: string | null,
    input: CategoryInput,
  ): Promise<string> {
    const menu = await this.loadMenu();
    const name = input.name.trim();
    if (!name) {
      throw new MenuAdminError("CATEGORY_NAME_REQUIRED");
    }
    const nameEn = input.nameEn ?? null;

    if (categoryId) {
      const existing = this.requireCategory(menu, categoryId);
      const slug =
        existing.name === name ? existing.slug : Slug.fromName(name);
      const updated = existing.withName(name, slug, nameEn);

      await this.menus.upsertCategory(menu.id, updated);
      return updated.id;
    }

    const category = Category.create({
      id: this.ids.next(),
      name,
      nameEn,
      slug: Slug.fromName(name),
      position: menu.categories.length,
      items: [],
    });

    await this.menus.upsertCategory(menu.id, category);
    return category.id;
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const menu = await this.loadMenu();
    const category = this.requireCategory(menu, categoryId);

    for (const item of category.items) {
      if (item.imageSource.type !== IMAGE_SOURCE_TYPE.PLACEHOLDER) {
        await this.images.delete(item.imageSource.url).catch(() => undefined);
      }
    }

    await this.menus.deleteCategoryById(categoryId);
  }

  async reorderCategories(orderedIds: string[]): Promise<void> {
    const menu = await this.loadMenu();
    try {
      menu.reorderCategories(orderedIds);
    } catch (error) {
      if (error instanceof DuplicatePosition) {
        throw new MenuAdminError("REORDER_CATEGORY_FAILED");
      }
      throw error;
    }
    await this.menus.updateCategoryOrder(menu.id, orderedIds);
  }

  async moveCategory(categoryId: string, direction: "up" | "down"): Promise<void> {
    const menu = await this.loadMenu();
    const ids = menu.categories.map((category) => category.id);
    const index = ids.indexOf(categoryId);
    if (index === -1) {
      throw new MenuAdminError("CATEGORY_NOT_FOUND");
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= ids.length) {
      return;
    }

    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
    await this.reorderCategories(ids);
  }

  async reorderCategoryItems(categoryId: string, orderedIds: string[]): Promise<void> {
    const menu = await this.loadMenu();
    const category = this.requireCategory(menu, categoryId);
    try {
      category.reorderItems(orderedIds);
    } catch (error) {
      if (error instanceof DuplicatePosition) {
        throw new MenuAdminError("REORDER_ITEM_FAILED");
      }
      throw error;
    }
    await this.menus.updateItemOrder(categoryId, orderedIds);
  }

  async moveItem(
    categoryId: string,
    itemId: string,
    direction: "up" | "down",
  ): Promise<void> {
    const menu = await this.loadMenu();
    const category = this.requireCategory(menu, categoryId);
    const ids = category.items.map((item) => item.id);
    const index = ids.indexOf(itemId);
    if (index === -1) {
      throw new MenuAdminError("ITEM_NOT_FOUND");
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= ids.length) {
      return;
    }

    [ids[index], ids[swapIndex]] = [ids[swapIndex], ids[index]];
    await this.reorderCategoryItems(categoryId, ids);
  }

  private requireCategory(menu: Menu, categoryId: string): Category {
    const category = menu.findCategory(categoryId);
    if (!category) {
      throw new MenuAdminError("CATEGORY_NOT_FOUND");
    }
    return category;
  }

  private requireItem(menu: Menu, categoryId: string, itemId: string): Item {
    const item = menu.findItem(categoryId, itemId);
    if (!item) {
      throw new MenuAdminError("ITEM_NOT_FOUND");
    }
    return item;
  }
}
