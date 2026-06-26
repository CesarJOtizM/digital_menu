import type { PriceFormatter } from "@/shared/domain";
import { formatPrice, type FormatPriceOptions } from "./format-price";

/**
 * Binds deploy config into a {@link PriceFormatter} that the shared `Price`
 * value object accepts via `Price.toDisplay(formatter)`. This keeps locale,
 * currency, and symbol-visibility decisions in the Config context while the
 * domain remains agnostic about how money is rendered.
 */
export function createPriceFormatter(
  options: FormatPriceOptions,
): PriceFormatter {
  return (centavos: number) => formatPrice(centavos, options);
}
