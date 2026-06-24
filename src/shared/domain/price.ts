import { InvalidPrice } from "./errors";

/**
 * Formats a raw centavos amount into a display string. Injected from the
 * Config context so locale/currency/symbol decisions live outside the domain.
 */
export type PriceFormatter = (centavos: number) => string;

export class Price {
  private constructor(private readonly _value: number) {}

  static create(value: number): Price {
    if (!Number.isInteger(value)) {
      throw new InvalidPrice("Price must be an integer (centavos)");
    }
    if (value < 0) {
      throw new InvalidPrice("Price must be >= 0");
    }
    return new Price(value);
  }

  get value(): number {
    return this._value;
  }

  add(other: Price): Price {
    return new Price(this._value + other._value);
  }

  toDisplay(format: PriceFormatter): string {
    return format(this._value);
  }

  equals(other: Price): boolean {
    return this._value === other._value;
  }
}
