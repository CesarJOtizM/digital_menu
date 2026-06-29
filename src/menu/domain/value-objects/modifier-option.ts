import { Price } from "@/shared/domain";

export interface ModifierOptionProps {
  id: string;
  name: string;
  nameEn?: string | null;
  priceDelta?: Price;
}

/**
 * A selectable choice inside a ModifierGroup. Carries a priceDelta in integer
 * centavos (default 0) that is ADDED to the effective price when selected.
 * Item-local: not shared across items; cloning duplicates it with a fresh id.
 */
export class ModifierOption {
  private constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _nameEn: string | null,
    private readonly _priceDelta: Price,
  ) {}

  static create(props: ModifierOptionProps): ModifierOption {
    return new ModifierOption(
      props.id,
      props.name,
      props.nameEn ?? null,
      props.priceDelta ?? Price.create(0),
    );
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get nameEn(): string | null {
    return this._nameEn;
  }

  get priceDelta(): Price {
    return this._priceDelta;
  }

  /** Duplicate this option with a brand-new id (Price is immutable). */
  cloneWithId(newId: string): ModifierOption {
    return new ModifierOption(newId, this._name, this._nameEn, this._priceDelta);
  }
}
