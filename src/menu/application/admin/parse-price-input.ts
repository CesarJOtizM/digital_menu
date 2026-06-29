import { MenuAdminError } from "./menu-admin-service";
import {
  formatCentavosAsPlainDecimal,
  formatPriceInputMask,
  normalizeMaskedPriceInput,
  type PriceInputFormatOptions,
} from "./price-input-format";

/** Parses a decimal or masked price string into integer centavos. */
export function parsePriceInputToCentavos(raw: string): number {
  const normalized = normalizeMaskedPriceInput(raw);
  if (!normalized) {
    throw new MenuAdminError("PRICE_REQUIRED");
  }

  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new MenuAdminError("PRICE_INVALID");
  }

  return Math.round(amount * 100);
}

/** Formats centavos as a decimal string for HTML number/text inputs. */
export function formatCentavosForInput(centavos: number): string {
  return formatCentavosAsPlainDecimal(centavos);
}

/** Formats centavos with locale-aware grouping and currency symbol. */
export function formatCentavosForPriceInput(
  centavos: number,
  options: PriceInputFormatOptions,
): string {
  return formatPriceInputMask(centavos, options);
}
