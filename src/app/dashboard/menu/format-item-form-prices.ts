import {
  formatCentavosForPriceInput,
  parsePriceInputToCentavos,
} from "@/menu/application/admin/parse-price-input";
import type { PriceInputFormatOptions } from "@/menu/application/admin/price-input-format";
import type { ItemFormValues } from "@/menu/application/admin/item-form-types";

function maskPriceField(raw: string, priceFormat: PriceInputFormatOptions): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  try {
    return formatCentavosForPriceInput(parsePriceInputToCentavos(trimmed), priceFormat);
  } catch {
    return trimmed;
  }
}

export function formatItemFormPriceValues(
  values: ItemFormValues,
  priceFormat: PriceInputFormatOptions,
): ItemFormValues {
  return {
    ...values,
    price: maskPriceField(values.price, priceFormat),
    variants: values.variants.map((variant) => ({
      ...variant,
      price: maskPriceField(variant.price, priceFormat),
    })),
    modifierGroups: values.modifierGroups.map((group) => ({
      ...group,
      options: group.options.map((option) => ({
        ...option,
        priceDelta: maskPriceField(option.priceDelta, priceFormat),
      })),
    })),
  };
}
