/**
 * Options that drive how an integer centavos amount is rendered. All formatting
 * decisions (locale, currency, symbol visibility, minor-unit precision) come
 * from deploy config — the domain never hardcodes a locale or currency.
 */
export interface FormatPriceOptions {
  readonly locale: string;
  readonly currency: string;
  readonly showSymbol: boolean;
  /**
   * Number of minor-unit (decimal) digits the currency uses. Defaults to 2
   * (centavos). Zero-decimal currencies (e.g. JPY) pass 0, in which case the
   * stored integer is already the whole-unit amount.
   */
  readonly decimalDigits?: number;
}

const DEFAULT_DECIMAL_DIGITS = 2;

/**
 * Formats an integer `centavos` amount into a locale-aware display string.
 *
 * - `showSymbol: true`  -> currency-formatted ("$24.50", "$ 24,50").
 * - `showSymbol: false` -> bare number using the locale's decimal/grouping
 *   separators with no currency symbol ("24.50", "24,50") — Azahar-style.
 *
 * Money stays integer end-to-end: the input is minor units (centavos), divided
 * down to major units only for display via Intl, never via lossy float math on
 * the stored value.
 */
export function formatPrice(
  centavos: number,
  options: FormatPriceOptions,
): string {
  const { locale, currency, showSymbol } = options;
  const decimalDigits = options.decimalDigits ?? DEFAULT_DECIMAL_DIGITS;

  const majorUnits = centavos / 10 ** decimalDigits;

  if (showSymbol) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: decimalDigits,
      maximumFractionDigits: decimalDigits,
    }).format(majorUnits);
  }

  return new Intl.NumberFormat(locale, {
    style: "decimal",
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
    useGrouping: true,
  }).format(majorUnits);
}
