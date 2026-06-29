export interface PriceInputFormatOptions {
  readonly locale: string;
  readonly currency: string;
}

/** Thousand and decimal separators derived from the deploy locale language. */
export function resolvePriceInputSeparators(locale: string): {
  group: string;
  decimal: string;
} {
  const language = locale.split("-")[0]?.toLowerCase();
  if (language === "es") {
    return { group: ".", decimal: "," };
  }
  return { group: ",", decimal: "." };
}

/** Narrow currency symbol for the configured ISO 4217 code (e.g. $, €). */
export function getCurrencySymbol(
  currency: string,
  locale: string,
): string {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(1);

  return parts.find((part) => part.type === "currency")?.value.trim() ?? "$";
}

/**
 * Strips currency symbols/spaces and normalizes grouping into a dot-decimal
 * string suitable for {@link Number} parsing (e.g. "1234.56").
 */
export function normalizeMaskedPriceInput(raw: string): string {
  let value = raw.trim();
  if (!value) {
    return "";
  }

  value = value.replace(/^\+/, "").replace(/[^\d.,-]/g, "");

  const lastComma = value.lastIndexOf(",");
  const lastDot = value.lastIndexOf(".");

  if (lastComma > lastDot) {
    value = value.replace(/\./g, "").replace(",", ".");
  } else if (lastDot > lastComma) {
    value = value.replace(/,/g, "");
  } else if (lastComma >= 0) {
    value = value.replace(",", ".");
  }

  return value;
}

/** Formats integer centavos with grouping, decimals, and currency symbol. */
export function formatPriceInputMask(
  centavos: number,
  options: PriceInputFormatOptions,
): string {
  const { group, decimal } = resolvePriceInputSeparators(options.locale);
  const symbol = getCurrencySymbol(options.currency, options.locale);
  const negative = centavos < 0;
  const abs = Math.abs(centavos);
  const major = abs / 100;
  const [intPart, fracPart] = major.toFixed(2).split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, group);

  const formatted = `${symbol}${grouped}${decimal}${fracPart}`;
  return negative ? `-${formatted}` : formatted;
}

/**
 * Live mask while typing: treats entered digits as centavos (e.g. "1250" → $12,50).
 */
export function formatPriceInputMaskWhileTyping(
  raw: string,
  options: PriceInputFormatOptions,
): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  const centavos = Number(digits);
  if (!Number.isFinite(centavos) || centavos < 0) {
    return "";
  }

  return formatPriceInputMask(centavos, options);
}

/** Plain dot-decimal string for hidden form fields and legacy callers. */
export function formatCentavosAsPlainDecimal(centavos: number): string {
  return (centavos / 100).toFixed(2);
}
