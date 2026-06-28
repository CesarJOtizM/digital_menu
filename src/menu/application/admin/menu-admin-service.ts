import { IMAGE_SOURCE_TYPE, ImageSource, Price, Slug } from "@/shared/domain";
import type { ImageStoragePort } from "@/shared/domain/ports";
import type { ModifierGroup, Variant } from "@/menu/domain";
import type { Menu } from "@/menu/domain";
import { Category, Item } from "@/menu/domain";
import type { MenuRepository } from "../ports/menu-repository";
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
  description: string;
  priceCentavos: number;
  active: boolean;
  variants: Variant[];
  modifierGroups: ModifierGroup[];
  imageSource: ImageSource;
  allergenIds: string[];
}

export interface CategoryInput {
  name: string;
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
    this.requireItem(menu, categoryId, itemId);

    await this.menus.save(
      menu.mapCategory(categoryId, (category) =>
        category.mapItem(itemId, (item) => item.toggleActive()),
      ),
    );
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
      description: input.description.trim(),
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

      await this.menus.save(
        menu.mapCategory(categoryId, (current) =>
          current.mapItem(itemId, () => updated),
        ),
      );
      return updated.id;
    }

    const newItem = Item.create({
      id: this.ids.next(),
      name: details.name,
      slug: Slug.fromName(details.name),
      description: details.description,
      basePrice: details.basePrice,
      imageSource: details.imageSource,
      active: details.active,
      position: category.items.length,
      allergenIds: details.allergenIds,
      variants: details.variants,
      modifierGroups: details.modifierGroups,
    });

    await this.menus.save(
      menu.mapCategory(categoryId, (current) => current.addItem(newItem)),
    );
    return newItem.id;
  }

  async deleteItem(categoryId: string, itemId: string): Promise<void> {
    const menu = await this.loadMenu();
    const existing = this.requireItem(menu, categoryId, itemId);

    if (existing.imageSource.type !== IMAGE_SOURCE_TYPE.PLACEHOLDER) {
      await this.images.delete(existing.imageSource.url).catch(() => undefined);
    }

    await this.menus.save(
      menu.mapCategory(categoryId, (category) => category.removeItem(itemId)),
    );
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

    if (categoryId) {
      const existing = this.requireCategory(menu, categoryId);
      const slug =
        existing.name === name ? existing.slug : Slug.fromName(name);
      const updated = existing.withName(name, slug);

      await this.menus.save(menu.mapCategory(categoryId, () => updated));
      return updated.id;
    }

    const category = Category.create({
      id: this.ids.next(),
      name,
      slug: Slug.fromName(name),
      position: menu.categories.length,
      items: [],
    });

    await this.menus.save(menu.addCategory(category));
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

    await this.menus.save(menu.removeCategory(categoryId));
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
