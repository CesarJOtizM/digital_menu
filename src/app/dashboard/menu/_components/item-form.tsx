import { ItemFormEditor } from "./item-form-editor";
import { getConfig } from "@/config/infrastructure";
import { getTranslations } from "@/i18n/server";
import { resolveAdminError, type TranslationParams } from "@/i18n";
import type { ItemFormValues } from "@/menu/application/admin/item-form-types";
import type { AllergenOption } from "@/menu/application/admin/allergen-types";
import { formatItemFormPriceValues } from "../format-item-form-prices";

interface ItemFormProps {
  categoryId?: string;
  categoryName?: string;
  categories?: readonly { id: string; name: string }[];
  itemId?: string;
  initial: ItemFormValues;
  allergens: AllergenOption[];
  title: string;
  returnTo?: string;
  error?: string;
  errorParams?: TranslationParams;
}

export async function ItemForm({
  error,
  errorParams,
  initial,
  ...props
}: ItemFormProps) {
  const [{ t }, config] = await Promise.all([getTranslations(), getConfig()]);
  const errorMessage = resolveAdminError(t, error, errorParams) ?? undefined;
  const priceFormat = {
    locale: config.locale,
    currency: config.currency,
  };

  return (
    <ItemFormEditor
      {...props}
      initial={formatItemFormPriceValues(initial, priceFormat)}
      priceFormat={priceFormat}
      error={errorMessage}
    />
  );
}
