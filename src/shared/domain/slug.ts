import { InvalidSlug } from "./errors";

export class Slug {
  private constructor(private readonly _value: string) {}

  static fromName(name: string): Slug {
    const slugified = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // strip diacritics
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "") // remove special chars
      .replace(/[\s_]+/g, "-") // collapse whitespace/underscores to hyphen
      .replace(/-+/g, "-") // collapse multiple hyphens
      .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

    if (slugified.length === 0) {
      throw new InvalidSlug("Slug cannot be empty after normalization");
    }

    return new Slug(slugified);
  }

  static fromExisting(value: string): Slug {
    return new Slug(value);
  }

  withSuffix(n: number): Slug {
    return new Slug(`${this._value}-${n}`);
  }

  get value(): string {
    return this._value;
  }

  equals(other: Slug): boolean {
    return this._value === other._value;
  }
}
