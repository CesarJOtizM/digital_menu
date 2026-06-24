import { Entity, Price } from "@/shared/domain";

export interface VariantProps {
  id: string;
  label: string;
  price: Price;
  position: number;
}

/**
 * A purchasable size/option of an Item. Carries an ABSOLUTE price in integer
 * centavos that overrides the Item base price when selected (not additive).
 */
export class Variant extends Entity<string> {
  private constructor(
    id: string,
    private readonly _label: string,
    private readonly _price: Price,
    private readonly _position: number,
  ) {
    super(id);
  }

  static create(props: VariantProps): Variant {
    return new Variant(props.id, props.label, props.price, props.position);
  }

  get label(): string {
    return this._label;
  }

  get price(): Price {
    return this._price;
  }

  get position(): number {
    return this._position;
  }

  /** Deep-clone into a fresh identity (Price is immutable, safe to share). */
  cloneWithId(newId: string): Variant {
    return new Variant(newId, this._label, this._price, this._position);
  }
}
