import { Entity, ImageSource, Price, Slug } from "@/shared/domain";
import { Variant } from "./variant";
import { ModifierGroup } from "./modifier-group";
import { AvailabilityWindow } from "../value-objects/availability-window";
import { UnknownVariant } from "../errors";

export interface ItemProps {
  id: string;
  name: string;
  slug: Slug;
  description: string;
  basePrice: Price;
  imageSource: ImageSource;
  active: boolean;
  position: number;
  allergenIds: string[];
  variants: Variant[];
  modifierGroups: ModifierGroup[];
  availability?: AvailabilityWindow;
}

const byPosition = <T extends { position: number }>(a: T, b: T): number =>
  a.position - b.position;

/**
 * Menu item (entity within the Menu aggregate). Owns its variants and
 * item-local modifier groups. Computes effective price as
 * (selected variant absolute price ?? base price) + Σ selected option deltas,
 * in pure integer centavos.
 */
export class Item extends Entity<string> {
  private constructor(
    id: string,
    private readonly _name: string,
    private readonly _slug: Slug,
    private readonly _description: string,
    private readonly _basePrice: Price,
    private readonly _imageSource: ImageSource,
    private readonly _active: boolean,
    private readonly _position: number,
    private readonly _allergenIds: readonly string[],
    private readonly _variants: readonly Variant[],
    private readonly _modifierGroups: readonly ModifierGroup[],
    private readonly _availability?: AvailabilityWindow,
  ) {
    super(id);
  }

  static create(props: ItemProps): Item {
    return new Item(
      props.id,
      props.name,
      props.slug,
      props.description,
      props.basePrice,
      props.imageSource,
      props.active,
      props.position,
      [...props.allergenIds],
      [...props.variants].sort(byPosition),
      [...props.modifierGroups].sort(byPosition),
      props.availability,
    );
  }

  get name(): string {
    return this._name;
  }

  get slug(): Slug {
    return this._slug;
  }

  get description(): string {
    return this._description;
  }

  get basePrice(): Price {
    return this._basePrice;
  }

  get imageSource(): ImageSource {
    return this._imageSource;
  }

  get active(): boolean {
    return this._active;
  }

  get position(): number {
    return this._position;
  }

  get allergenIds(): string[] {
    return [...this._allergenIds];
  }

  get variants(): Variant[] {
    return [...this._variants];
  }

  get modifierGroups(): ModifierGroup[] {
    return [...this._modifierGroups];
  }

  get availability(): AvailabilityWindow | undefined {
    return this._availability;
  }

  /**
   * Effective price = (selected variant absolute price ?? base price) plus the
   * summed deltas of the selected modifier options. Enforces each group's
   * min/max selection rules. Pure integer centavos.
   */
  effectivePrice(variantId?: string, selectedOptionIds: string[] = []): Price {
    let price = this.resolveBasePrice(variantId);

    for (const group of this._modifierGroups) {
      const groupSelection = selectedOptionIds.filter((optionId) =>
        group.options.some((option) => option.id === optionId),
      );
      group.validateSelection(groupSelection);
      price = price.add(group.priceDeltaFor(groupSelection));
    }

    return price;
  }

  /** Return a copy of this item with its modifier groups replaced (immutably). */
  replaceModifierGroups(groups: ModifierGroup[]): Item {
    return new Item(
      this.id,
      this._name,
      this._slug,
      this._description,
      this._basePrice,
      this._imageSource,
      this._active,
      this._position,
      this._allergenIds,
      this._variants,
      [...groups].sort(byPosition),
      this._availability,
    );
  }

  private resolveBasePrice(variantId?: string): Price {
    if (variantId === undefined) {
      return this._basePrice;
    }
    const variant = this._variants.find((candidate) => candidate.id === variantId);
    if (!variant) {
      throw new UnknownVariant(`Variant "${variantId}" not found on item "${this.id}"`);
    }
    return variant.price;
  }
}
