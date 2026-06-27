import { Entity, Slug } from "@/shared/domain";
import { Category } from "./category";
import { Item } from "./item";
import { DuplicatePosition } from "../errors";

const MENU_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

type MenuStatus = (typeof MENU_STATUS)[keyof typeof MENU_STATUS];

export interface MenuProps {
  id: string;
  name: string;
  slug: Slug;
  categories: Category[];
  status?: MenuStatus;
}

const byPosition = <T extends { position: number }>(a: T, b: T): number =>
  a.position - b.position;

/**
 * Menu aggregate root. Owns ordered Categories (each owning ordered Items). The
 * aggregate is the consistency/transaction boundary for reorder and publish, so
 * those operations return a new Menu without cross-aggregate coordination.
 */
export class Menu extends Entity<string> {
  private constructor(
    id: string,
    private readonly _name: string,
    private readonly _slug: Slug,
    private readonly _status: MenuStatus,
    private readonly _categories: readonly Category[],
  ) {
    super(id);
  }

  static create(props: MenuProps): Menu {
    return new Menu(
      props.id,
      props.name,
      props.slug,
      props.status ?? MENU_STATUS.DRAFT,
      [...props.categories].sort(byPosition),
    );
  }

  get name(): string {
    return this._name;
  }

  get slug(): Slug {
    return this._slug;
  }

  get status(): MenuStatus {
    return this._status;
  }

  get categories(): Category[] {
    return [...this._categories];
  }

  publish(): Menu {
    return this.withStatus(MENU_STATUS.PUBLISHED);
  }

  unpublish(): Menu {
    return this.withStatus(MENU_STATUS.DRAFT);
  }

  /**
   * Reorder categories by an explicit list of ids. The list MUST cover every
   * category exactly once. Returns a new Menu; the aggregate is the single
   * transaction boundary so callers persist the whole result atomically.
   */
  reorderCategories(orderedIds: string[]): Menu {
    this.assertCoversAllCategories(orderedIds);
    const reordered = orderedIds.map((categoryId, index) => {
      const category = this._categories.find((candidate) => candidate.id === categoryId);
      // assertCoversAllCategories guarantees category is defined.
      return category!.withPosition(index);
    });
    return new Menu(this.id, this._name, this._slug, this._status, reordered);
  }

  mapCategory(
    categoryId: string,
    transform: (category: Category) => Category,
  ): Menu {
    return new Menu(
      this.id,
      this._name,
      this._slug,
      this._status,
      this._categories.map((category) =>
        category.id === categoryId ? transform(category) : category,
      ),
    );
  }

  addCategory(category: Category): Menu {
    return new Menu(this.id, this._name, this._slug, this._status, [
      ...this._categories,
      category,
    ]);
  }

  removeCategory(categoryId: string): Menu {
    return new Menu(
      this.id,
      this._name,
      this._slug,
      this._status,
      this._categories.filter((category) => category.id !== categoryId),
    );
  }

  findCategory(categoryId: string): Category | undefined {
    return this._categories.find((category) => category.id === categoryId);
  }

  findItem(categoryId: string, itemId: string): Item | undefined {
    return this.findCategory(categoryId)?.findItem(itemId);
  }

  private withStatus(status: MenuStatus): Menu {
    return new Menu(this.id, this._name, this._slug, status, this._categories);
  }

  private assertCoversAllCategories(orderedIds: string[]): void {
    const unique = new Set(orderedIds);
    if (
      unique.size !== orderedIds.length ||
      unique.size !== this._categories.length ||
      !this._categories.every((category) => unique.has(category.id))
    ) {
      throw new DuplicatePosition(
        "reorderCategories requires each category id exactly once",
      );
    }
  }
}

export { MENU_STATUS };
export type { MenuStatus };
