import { Entity, Slug } from "@/shared/domain";
import { Item } from "./item";
import { AvailabilityWindow } from "../value-objects/availability-window";

export interface CategoryProps {
  id: string;
  name: string;
  slug: Slug;
  position: number;
  items: Item[];
  availability?: AvailabilityWindow;
}

const byPosition = <T extends { position: number }>(a: T, b: T): number =>
  a.position - b.position;

/**
 * Category entity within the Menu aggregate. Owns an ordered list of Items and
 * an optional availability window that gates all of its items.
 */
export class Category extends Entity<string> {
  private constructor(
    id: string,
    private readonly _name: string,
    private readonly _slug: Slug,
    private readonly _position: number,
    private readonly _items: readonly Item[],
    private readonly _availability?: AvailabilityWindow,
  ) {
    super(id);
  }

  static create(props: CategoryProps): Category {
    return new Category(
      props.id,
      props.name,
      props.slug,
      props.position,
      [...props.items].sort(byPosition),
      props.availability,
    );
  }

  get name(): string {
    return this._name;
  }

  get slug(): Slug {
    return this._slug;
  }

  get position(): number {
    return this._position;
  }

  get items(): Item[] {
    return [...this._items];
  }

  get availability(): AvailabilityWindow | undefined {
    return this._availability;
  }

  /** Return a copy of this category with a new position (immutable reorder). */
  withPosition(position: number): Category {
    return this.rebuild({ position });
  }

  withName(name: string, slug: Slug): Category {
    return this.rebuild({ name, slug });
  }

  withItems(items: Item[]): Category {
    return this.rebuild({ items: [...items].sort(byPosition) });
  }

  mapItem(itemId: string, transform: (item: Item) => Item): Category {
    return this.withItems(
      this._items.map((item) => (item.id === itemId ? transform(item) : item)),
    );
  }

  addItem(item: Item): Category {
    return this.withItems([...this._items, item]);
  }

  removeItem(itemId: string): Category {
    return this.withItems(this._items.filter((item) => item.id !== itemId));
  }

  findItem(itemId: string): Item | undefined {
    return this._items.find((item) => item.id === itemId);
  }

  private rebuild(
    patch: Partial<{
      name: string;
      slug: Slug;
      position: number;
      items: readonly Item[];
      availability: AvailabilityWindow | undefined;
    }>,
  ): Category {
    return new Category(
      this.id,
      patch.name ?? this._name,
      patch.slug ?? this._slug,
      patch.position ?? this._position,
      patch.items ?? this._items,
      patch.availability ?? this._availability,
    );
  }
}
