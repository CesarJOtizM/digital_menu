import { Entity, Slug } from "@/shared/domain";

export interface AllergenProps {
  id: string;
  name: string;
  slug: Slug;
  icon?: string;
}

/**
 * Allergen reference vocabulary entry. A small standalone aggregate: Items
 * reference allergens by id only (no join entity in the domain).
 */
export class Allergen extends Entity<string> {
  private constructor(
    id: string,
    private readonly _name: string,
    private readonly _slug: Slug,
    private readonly _icon?: string,
  ) {
    super(id);
  }

  static create(props: AllergenProps): Allergen {
    return new Allergen(props.id, props.name, props.slug, props.icon);
  }

  get name(): string {
    return this._name;
  }

  get slug(): Slug {
    return this._slug;
  }

  get icon(): string | undefined {
    return this._icon;
  }
}
